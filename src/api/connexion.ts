import axios from 'axios';
import {
    uploadAsync,
    downloadAsync,
    FileSystemUploadType,
} from 'expo-file-system/legacy';
import { Response } from '../models/Reponse';

/**
 * Singleton HTTP client for the RAVE-ONNX Flask server.
 * Holds the server base url and wraps every endpoint of the API.
 * NOTE: the server answers HTTP 200 even on errors, so /upload success is
 * detected from the response body text, not from the status code.
 */
export class Connexion {
    private url: string;
    private connected: boolean;

    public static instance: Connexion;

    private constructor() {
        this.url = '';
        this.connected = false;
    }

    public static getInstance(): Connexion {
        if (!Connexion.instance) {
            Connexion.instance = new Connexion();
        }
        return Connexion.instance;
    }

    /** Store the server base url (e.g. http://192.168.1.10:8000), trailing slash removed. */
    public setUrl(url: string): void {
        this.url = url.replace(/\/+$/, '');
    }

    public getUrl(): string {
        return this.url;
    }

    public isConnectedNow(): boolean {
        return this.connected;
    }

    /** Ping "/" to check the server is reachable. */
    public async isConnected(): Promise<boolean> {
        try {
            const response = await axios.get(this.url + '/');
            this.connected = response.status === 200;
        } catch {
            this.connected = false;
        }
        return this.connected;
    }

    /** Upload a local audio file (by uri) as multipart "file"; server transforms it. */
    public async uploadFile(uri: string): Promise<Response<string>> {
        if (!this.connected) {
            return { success: false, error: { message: 'Erreur de connexion' } };
        }
        try {
            const response = await uploadAsync(this.url + '/upload', uri, {
                fieldName: 'file',
                httpMethod: 'POST',
                uploadType: FileSystemUploadType.MULTIPART,
            });
            // Server returns 200 even on failure, so inspect the body text.
            if (!response.body.includes('Computation done')) {
                return { success: false, error: { message: response.body } };
            }
            return { success: true, data: response.body };
        } catch (e) {
            return { success: false, error: { message: String(e) } };
        }
    }

    /** Download the last transformed file into the given local destination uri. */
    public async download(destUri: string): Promise<Response<string>> {
        if (!this.connected) {
            return { success: false, error: { message: 'Erreur de connexion' } };
        }
        try {
            const { uri, status } = await downloadAsync(this.url + '/download', destUri);
            if (status !== 200) {
                return { success: false, error: { message: 'Erreur serveur' } };
            }
            return { success: true, data: uri };
        } catch (e) {
            return { success: false, error: { message: String(e) } };
        }
    }

    /** Fetch the list of available models from the server. */
    public async getModels(): Promise<Response<string[]>> {
        if (!this.connected) {
            return { success: false, error: { message: 'Erreur de connexion' } };
        }
        try {
            const response = await axios.get<{ models: string[] }>(this.url + '/getmodels');
            return { success: true, data: response.data.models };
        } catch (e) {
            return { success: false, error: { message: String(e) } };
        }
    }

    /** Ask the server to use a given model for the next transformation. */
    public async selectModel(model: string): Promise<Response<string>> {
        if (!this.connected) {
            return { success: false, error: { message: 'Erreur de connexion' } };
        }
        try {
            const response = await axios.get(this.url + '/selectModel/' + model);
            return { success: true, data: response.data };
        } catch (e) {
            return { success: false, error: { message: String(e) } };
        }
    }
}
