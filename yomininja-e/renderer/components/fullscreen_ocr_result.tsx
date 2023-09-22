import { useContext, useEffect, useState } from "react";
import { OcrResultContext } from "../context/ocr_result.provider";
import { styled } from "@mui/material";
import { OcrItemScalable } from "../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";


const OcrResultBox = styled('div')({
    border: 'solid 1px red',
    borderRadius: '2rem',    
    position: 'absolute',
    color: 'transparent',
    transformOrigin: 'top left',
    paddingLeft: '0.5%',
    paddingRight: '0.5%',
    textAlign: 'center',
    letterSpacing: '0.1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    ":hover": {
        backgroundColor: 'black',
        color: 'white',
        fontFamily: "arial"
    }
});



export default function FullscreenOcrResult() {

    const { ocrResult } = useContext( OcrResultContext );
    const [ hoveredText, setHoveredText ] = useState< string >('asdf');
    
    const [ hoveredElement, setHoveredElement ] = useState< HTMLElement | null >( null );
    
    function createOcrResultBox( item: OcrItemScalable, idx: number ): JSX.Element {

        const { box } = item;

        return (
            <OcrResultBox key={idx}
                sx={{
                    left: box.position.left + '%',
                    top: box.position.top + '%',
                    transform: `rotate( ${box.angle_degrees}deg )`,
                    minWidth: box.dimensions.width + '%',
                    minHeight: box.dimensions.height + '%',
                    fontSize: box.dimensions.height * 50 + '%',                    
                }}
                onMouseEnter={ () => ( setHoveredText( item.text ) ) }
            >
                { item.text }
            </OcrResultBox>
        )
    }


    useEffect( () => {

        const handleMouseOver = ( e: MouseEvent ) => {
            setHoveredElement( e.target as HTMLElement );
        };

        const handleMouseOut = () => {
            setHoveredElement( null );
        };

        document.addEventListener( 'mouseover', handleMouseOver );
        document.addEventListener( 'mouseout', handleMouseOut );

        return () => {
            document.removeEventListener( 'mouseover', handleMouseOver );
            document.removeEventListener( 'mouseout', handleMouseOut );
        };
    }, []);

    useEffect(() => {

        const handleKeyPress = ( e: KeyboardEvent ) => {

            // console.log(e.key);
            if ( e.key === 'c' && hoveredElement) {
                global.ipcRenderer.invoke( 'user_command:copy_to_clipboard', hoveredText );
            }
            else if ( e.key === 'PrintScreen' ) {
                global.ipcRenderer.invoke( 'user_command:printscreen', undefined );
            }
        };

        document.addEventListener('keyup', handleKeyPress);

        return () => {
            document.removeEventListener('keyup', handleKeyPress);
        };

    }, [ hoveredElement, global.ipcRenderer ]);


    return (
        <>
            { ocrResult?.results?.map( createOcrResultBox ) }        
        </> 
    );
}