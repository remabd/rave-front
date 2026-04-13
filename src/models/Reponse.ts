export type Response<D = null, E = ApiError> =
    | {
          success: true;
          data: D;
      }
    | {
          success: false;
          error: E;
      };

export interface ApiError {
    message: string;
}
