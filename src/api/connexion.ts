import axios from 'axios';
import { Record } from '../models/record';
import { Response } from '../models/Reponse';

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

    public setUrl(url: string): void {
        this.url = url;
    }

    public async isConnected(): Promise<boolean> {
        const response = await axios.get(this.url + '/');
        if (response.status === 200) {
            this.connected = true;
            return true;
        }
        return false;
    }

    public async uploadRecord(record: Record): Promise<Response> {
        if (!this.connected) {
            return {
                success: false,
                error: { message: 'Erreur de connection' },
            };
        }
        const response = await axios.post(this.url + '/upload/', { record: record });
        if (response.status !== 200) {
            return {
                success: false,
                error: { message: 'Erreur serveur' },
            };
        }
        return {
            success: true,
            data: response.data,
        };
    }

    public async download(): Promise<Response> {
        if (!this.connected) {
            return {
                success: false,
                error: { message: 'Erreur de connection' },
            };
        }
        const response = await axios.get(this.url + 'download');
        if (response.status !== 200) {
            return {
                success: false,
                error: { message: response.data },
            };
        }
        return {
            success: true,
            data: response.data,
        };
    }

    public async getModels(): Promise<Response<string>> {
        if (!this.connected) {
            return {
                success: false,
                error: { message: 'Erreur de connection' },
            };
        }
        const response = await axios.get(this.url + 'getmodels');
        if (response.status !== 200) {
            return {
                success: false,
                error: { message: response.data },
            };
        }
        return {
            success: true,
            data: response.data,
        };
    }

    public async selectModel(model: string): Promise<Response> {
        if (!this.connected) {
            return {
                success: false,
                error: { message: 'Erreur de connection' },
            };
        }
        const response = await axios.get(this.url + '/selectModel/' + model);
        if (response.status !== 200) {
            return {
                success: false,
                error: { message: 'Erreur serveur' },
            };
        }
        return {
            success: true,
            data: response.data,
        };
    }
}
