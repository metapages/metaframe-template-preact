export interface FileBlob {
  name: string;
  value?: any;
  urlEncoded?: string;
  type?:string;//??
  cached: boolean;
  size?: number;
  arrived?: Date;
}
