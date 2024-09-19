export interface SignInResponse {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}
