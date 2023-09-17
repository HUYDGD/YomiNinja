import { OcrResult, OcrResultProperties } from "../../domain/ocr_result/ocr_result";
import { OcrAdapter, OcrAdapterStatus, OcrRecognitionInput } from "../../application/adapters/ocr.adapter";
import * as grpc from '@grpc/grpc-js';
import { OCRServiceClient } from "../../../grpc/rpc/ocr_service/OCRService";
import { RecognizeDefaultResponse__Output } from "../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { GetSupportedLanguagesResponse__Output } from "../../../grpc/rpc/ocr_service/GetSupportedLanguagesResponse";
import { ocrServiceProto } from "../../../grpc/grpc_protos";


  

export class OcrPpOcrAdapter implements OcrAdapter {

    static _name: string = "OcrPpOcrAdapter";
    public readonly name: string = OcrPpOcrAdapter._name;
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private ocrServiceClient: OCRServiceClient;

    constructor() {
        this.ocrServiceClient = new ocrServiceProto.ocr_service.OCRService(
            "0.0.0.0:12345",
            grpc.credentials.createInsecure()
        );
        this.status = OcrAdapterStatus.Enabled;
    }

    initialize() {}

    async recognize( input: OcrRecognitionInput ): Promise< OcrResult | null > {

        if ( this.status != OcrAdapterStatus.Enabled )
            return null;
        
        const clientResponse = await new Promise< RecognizeDefaultResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient.RecognizeBytes( {
                id: input.id.toString(),
                image_bytes: input.imageBuffer,
                language_code: input.languageCode
            }, ( error, response ) => {
                if (error) {
                    return reject(error)
                }
                resolve(response);
            })
        );

        if ( !clientResponse )
            return null;

        return OcrResult.create({
            id: input.id,
            props: {
                context_resolution: clientResponse.context_resolution,
                results: clientResponse.results,
            } as OcrResultProperties
        });        
    }
    async getSupportedLanguages(): Promise< string[] > {
        
        const clientResponse = await new Promise< GetSupportedLanguagesResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient.GetSupportedLanguages( {}, ( error, response ) => {
                if (error) {
                    return reject(error)
                }
                resolve(response);
            })
        );
        
        if ( !clientResponse )
            return [];

        console.log( clientResponse );
        
        return clientResponse.language_codes;
    }
}