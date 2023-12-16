import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography, styled } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { OcrTemplatesContext } from "../../context/ocr_templates.provider";
import { OcrTemplate } from "../../../electron-src/@core/domain/ocr_template/ocr_template";
import { CaptureSourceContext } from "../../context/capture_source.provider";
import Image  from 'next/image';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'max-content',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 3,
};

  
export type CreateOcrTemplateModalProps = {
    open: boolean;
    handleClose: () => void;
    template?: OcrTemplate;
    captureSourceImage?: Buffer;
};

export default function CreateOcrTemplateModal( props: CreateOcrTemplateModalProps ) {

    const { open, handleClose } = props;

    const [ name, setName ] = useState< string >('');
    const [ image, setImage ] = useState< Buffer >();

    const {
        createOcrTemplate,
        getOcrTemplates,
        loadOcrTemplate,
        ocrTemplates
    } = useContext( OcrTemplatesContext );
    const {
        captureSourceImage,
        captureSourceImageBase64
    } = useContext( CaptureSourceContext );


    useEffect( () => {

        global.ipcRenderer.invoke( 'app:editing_ocr_template', open );

    }, [open]);

    useEffect( () => {
        setImage( captureSourceImage )
    }, [captureSourceImage] );

    async function saveOcrTemplate() {

        const template = await createOcrTemplate({
            image: captureSourceImage,
            name,
        });

        console.log(template);

        await loadOcrTemplate( template.id );

        handleClose();
    }

    return (
        <Modal open={open}
            style={{
                zIndex: 4000,
            }}
        >
            <Box sx={style}>
                <Typography variant="h6" component="h2" mb={4}>
                    New OCR Template
                </Typography>
                
                <TextField
                    label="Name"
                    required
                    value={ name }
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setName(event.target.value);
                    }}
                    sx={{ width: '100%' }}
                />


                <Box display='flex' justifyContent='center' flexDirection='column'>
                    <Typography align="center" mt={4} mb={2}>
                        Press the OCR hotkey to set the capture source image
                    </Typography>

                    { captureSourceImage &&
                        <img src={ 'data:image/png;base64,' + captureSourceImageBase64 }
                            alt="capture source image"
                            style={{
                                // maxWidth: '50%',
                                maxHeight: '50vh',
                                userSelect: 'none',
                                objectFit: 'cover',
                                margin: 'auto',
                                border: 'solid 1px #90caf9'
                            }}
                        />
                    }
                </Box>


                <Box display='flex' justifyContent='end' mt={4}>
                    <Button variant='contained' size="medium"
                        disabled={ !Boolean( name && image ) }
                        sx={{ m: 1 }}
                        onClick={ saveOcrTemplate }
                    >
                        Save
                    </Button>
                    <Button variant='outlined' size="medium"
                        sx={{ m: 1, backgroundColor: '' }}
                        onClick={ handleClose }
                    >
                        Close
                    </Button>
                </Box>

            </Box>
        </Modal>
    )
}