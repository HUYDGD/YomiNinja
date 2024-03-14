import { OCRServiceClient } from "../../../../../grpc/rpc/ocr_service/OCRService";
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { ocrServiceProto } from "../../../../../grpc/grpc_protos";
import * as grpc from '@grpc/grpc-js';
import { OcrAdapterStatus } from "../../../application/adapters/ocr.adapter";
import { OcrItem, OcrItemBox, OcrResult } from "../../../domain/ocr_result/ocr_result";
import { RecognizeDefaultResponse__Output } from "../../../../../grpc/rpc/ocr_service/RecognizeDefaultResponse";
import { RecognizeBase64Request } from "../../../../../grpc/rpc/ocr_service/RecognizeBase64Request";
import os from 'os';
import { join } from "path";
import isDev from 'electron-is-dev';
import { BIN_DIR } from "../../../../util/directories.util";
export class PyOcrService {
    
    public status: OcrAdapterStatus = OcrAdapterStatus.Disabled;
    private ocrServiceClient: OCRServiceClient | null = null;
    private serviceProcess: ChildProcessWithoutNullStreams;
    private binRoot: string;

    constructor() {
        this.binRoot = isDev
            ? join( BIN_DIR, `/${os.platform()}/py_ocr_service/service` )
            : join( process.resourcesPath, '/bin/py_ocr_service/service' );
    }

    connect( serviceAddress: string ) {
        
        if ( !serviceAddress )
            return;
    
        console.log("Initializing PyOcrService | Address: "+ serviceAddress );

        this.ocrServiceClient = new ocrServiceProto.ocr_service.OCRService(
            serviceAddress,
            grpc.credentials.createInsecure(),
        );

        this.status = OcrAdapterStatus.Enabled;
    }

    async recognize(
        input: {
            id: string;
            image: Buffer;
            ocrEngine: 'MangaOCR' | string;
            languageCode: string;
            boxes?: OcrItemBox[]
        }
    ): Promise< OcrResult | null > {

        const requestInput: RecognizeBase64Request = {
            id: input.id,
            base64_image: input.image.toString( 'base64' ),
            ocr_engine: input.ocrEngine,
            boxes: input?.boxes || [],
            language_code: input.languageCode
        };

        this.status = OcrAdapterStatus.Processing;
        // console.time('PpOcrAdapter.recognize');        
        const clientResponse = await new Promise< RecognizeDefaultResponse__Output | undefined >(
            (resolve, reject) => this.ocrServiceClient?.RecognizeBase64( requestInput, ( error, response ) => {
                if (error) {
                    this.restart( () => {} );
                    return reject(error)
                }
                resolve(response);
            })
        );
        // console.timeEnd('PpOcrAdapter.recognize');
        this.status = OcrAdapterStatus.Enabled;

        if ( !clientResponse )
            return null;
        
        if (
            !clientResponse?.context_resolution ||
            !clientResponse?.results
        )
            return null;
        
        const ocrItems: OcrItem[] = clientResponse.results.map( ( item ) => {
            return {
                ...item,
                text: [{
                    content: item.text
                }],
            } as OcrItem
        });

        const result = OcrResult.create({
            id: parseInt(clientResponse.id),
            context_resolution: clientResponse.context_resolution,
            results: ocrItems,
        });

        console.log( clientResponse );

        return result;

    }

    startProcess( onInitialized?: ( input?: any ) => void ) {

        const platform = os.platform();

        let executableName = 'py_ocr_service.exe';

        if ( platform === 'linux' )
            executableName = 'py_ocr_service';

        const executable = join( this.binRoot + `/${executableName}` );
        
        this.serviceProcess = spawn(
            executable,
            [],
            { cwd: this.binRoot }
        );

        // Handle stdout data
        this.serviceProcess.stdout.on('data', ( data: string ) => {

            console.log(`stdout: ${data.toString()}`);        

            if ( data.includes('[INFO-JSON]:') ) {

                const jsonData = JSON.parse( data.toString().split('[INFO-JSON]:')[1] );

                if ( 'server_address' in jsonData ) {
                    this.connect( jsonData.server_address );
                    if ( onInitialized )
                        onInitialized();
                }
            }
            
        });

        this.serviceProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        // Handle process exit
        this.serviceProcess.on('close', (code) => {
            console.log(`${executableName} process exited with code ${code}`);

            if ( this.status != OcrAdapterStatus.Restarting )
                this.restart( () => {} );
        });

        process.on('exit', () => {
            // Ensure the child process is killed before exiting
            this.serviceProcess.kill('SIGTERM'); // You can use 'SIGINT' or 'SIGKILL' as well
        });
          
    }

    async processStatusCheck(): Promise< boolean > {
        
        let triesCounter = 0;

        while( this.status != OcrAdapterStatus.Enabled ) {

            // Waiting for 2 seconds
            await new Promise( (resolve) => setTimeout(resolve, 2000) );
            triesCounter++;

            console.log('PyOcrService.processStatusCheck | counter: '+ triesCounter);

            if ( triesCounter > 15 ) return false;
        }

        return true
    }

    restart( callback: () => void ) {

    }
}