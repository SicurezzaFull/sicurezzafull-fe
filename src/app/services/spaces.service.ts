// src/app/spaces.service.ts

import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SpacesService {
    public spacesEndpoint = new AWS.Endpoint(environment.spacesEndpoint);
    public bucketName = 'sicurezzafull';

    public s3 = new AWS.S3({
        endpoint: this.spacesEndpoint,
        accessKeyId: environment.accessKeyId,
        secretAccessKey: environment.secretAccessKey,
    });

    getSignedUrl(key: string): string {
        return this.s3.getSignedUrl('getObject', {
            Bucket: this.bucketName,
            Key: key,
            Expires: 63600,
        });
    }

    async fetchImageBase64(key: string): Promise<string> {
        const url = this.getSignedUrl(key);
        const response = await fetch(url);
        const blob = await response.blob();
        return this.convertBlobToBase64(blob);
    }

    convertBlobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}
