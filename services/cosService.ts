
import COS from 'cos-js-sdk-v5';
import { CloudConfig } from '../types';

let cosInstance: any = null;
let currentConfig: CloudConfig | null = null;

export const initCOS = (config: CloudConfig) => {
  if (!config.secretId || !config.secretKey || !config.bucket || !config.region) {
    console.warn("Incomplete Cloud Config");
    return;
  }
  currentConfig = config;
  cosInstance = new COS({
    SecretId: config.secretId,
    SecretKey: config.secretKey,
  });
};

export const uploadFile = async (file: File): Promise<string> => {
  if (!cosInstance || !currentConfig) {
    throw new Error("腾讯云服务未配置");
  }

  const key = `island_life/images/${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`;
  
  return new Promise((resolve, reject) => {
    cosInstance.putObject({
      Bucket: currentConfig!.bucket,
      Region: currentConfig!.region,
      Key: key,
      Body: file,
    }, (err: any, data: any) => {
      if (err) {
        console.error("COS Upload Error", err);
        reject(err);
      } else {
        // Construct standard URL. If bucket is private, this needs signature, but for this demo assuming public-read or standard construction
        const url = `https://${currentConfig!.bucket}.cos.${currentConfig!.region}.myqcloud.com/${key}`;
        resolve(url);
      }
    });
  });
};

export const saveDataJson = async (data: any): Promise<void> => {
  if (!cosInstance || !currentConfig) return;

  const key = `island_life/user_data.json`;
  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: 'application/json' });

  return new Promise((resolve, reject) => {
    cosInstance.putObject({
      Bucket: currentConfig!.bucket,
      Region: currentConfig!.region,
      Key: key,
      Body: blob,
    }, (err: any) => {
      if (err) {
        console.error("Save Data Error", err);
        reject(err);
      } else {
        console.log("Data synced to cloud");
        resolve();
      }
    });
  });
};

export const loadDataJson = async (): Promise<any> => {
  if (!cosInstance || !currentConfig) throw new Error("Not configured");

  const key = `island_life/user_data.json`;
  const url = `https://${currentConfig!.bucket}.cos.${currentConfig!.region}.myqcloud.com/${key}`;

  // Try to fetch to see if it exists. Note: This requires CORS enabled on bucket.
  // Alternatively use getObject
  return new Promise((resolve, reject) => {
    cosInstance.getObject({
        Bucket: currentConfig!.bucket,
        Region: currentConfig!.region,
        Key: key,
    }, (err: any, data: any) => {
        if (err) {
            reject(err);
        } else {
            try {
                const json = JSON.parse(data.Body);
                resolve(json);
            } catch (e) {
                reject(e);
            }
        }
    });
  });
};
