import { CSSProperties, useEffect, useRef, useState } from "react";
import { OcrItemScalable, OcrTextLineSymbolScalable } from "../../../electron-src/@core/domain/ocr_result_scalable/ocr_result_scalable";
import { styled } from "@mui/material";
import { OverlayBehavior, OverlayHotkeys, OverlayOcrItemBoxVisuals } from "../../../electron-src/@core/domain/settings_preset/settings_preset_overlay";
import OcrResultLine from "./OcrResultLine";

const BaseOcrResultBox = styled('div')({
    // border: 'solid',
    outline: 'solid',
    position: 'absolute',
    fontFamily: "arial",
    // color: 'transparent',
    contentVisibility: 'hidden',
    transformOrigin: 'top left',
    paddingLeft: '0%',
    paddingRight: '0%',
    textAlign: 'center',
    // letterSpacing: '0.1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'auto'
});


export default function OcrResultBox( props: {
    ocrItem: OcrItemScalable;
    ocrRegionSize: { // Pixels
        width: number;
        height: number;
    };
    ocrItemBoxVisuals: OverlayOcrItemBoxVisuals;
    overlayHotkeys: OverlayHotkeys;
    overlayBehavior: OverlayBehavior;
    contentEditable: boolean;
    onMouseEnter?: ( item: OcrItemScalable ) => void;
    onMouseLeave?: () => void;
    onClick?: ( item: OcrItemScalable ) => void;
    onDoubleClick?: () => void;
    onBlur?: () => void;
} ): JSX.Element {
    
    const {
        ocrItem,
        ocrRegionSize,
        ocrItemBoxVisuals,
        overlayBehavior,
        contentEditable
    } = props;
    const { box } = ocrItem;

    const boxRef = useRef(null);

    const isMultiline = ocrItem.text.length > 1;
    
    const [ alignItems, setAlignItems ] = useState( 'center' );

    useEffect( () => {

        if ( isMultiline )
            setAlignItems( 'flex-start' );
        else 
            setAlignItems( 'center' );

    }, [ ocrItem ] );


    useEffect( () => {

        if ( !boxRef?.current ) return;
        
        const observer = new MutationObserver( ( mutations ) => {
            mutations.forEach( ( mutation ) => {
                
                if ( mutation.type !== 'childList' ) 
                    return;

                const addedNodes = Array.from( mutation.addedNodes );
                
                if ( !addedNodes.some( node => node.nodeName === 'RUBY' ) ) 
                    return;

                console.log('A <ruby> child was added!');

                if ( alignItems !== 'flex-start' )
                    setAlignItems( 'flex-start' );                                        
            });
        });
    
        observer.observe( boxRef.current, { childList: true, subtree: true } );

        return () => observer.disconnect();
    }, [] );

    // const fontSize = isVertical ? box.dimensions.width * 90 : box.dimensions.height * 65;
    
    const regionWidthPx = ocrRegionSize.width * window.innerWidth;
    const regionHeightPx = ocrRegionSize.height * window.innerHeight;
    
    const boxWidthPx = regionWidthPx * ( box.dimensions.width / 100 );
    const boxHeightPx = regionHeightPx * ( box.dimensions.height / 100 );
    
    let { isVertical } = box;

    const fontSize = isVertical ? boxWidthPx * 0.7 : boxHeightPx * 0.75; // Pixels

    let { font_size_factor } = ocrItemBoxVisuals.text;

    if ( isVertical )
        font_size_factor = font_size_factor * 1.10;

    const fontSizeOffset =  ( fontSize * ( font_size_factor / 100 ) ) - fontSize;

    // if ( box.angle_degrees < -70 )
    //     isVertical = true;

    let adjustedFontSize = ( fontSize + fontSizeOffset ); // px

    if ( ocrItem.text.length > 0 )
        adjustedFontSize = ( adjustedFontSize / ocrItem.text.length );

    const activeBoxCss: CSSProperties = {
        backgroundColor: ocrItemBoxVisuals?.background_color || 'black',
        color: ocrItemBoxVisuals?.text.color || 'white',
        fontSize: adjustedFontSize + 'px', // isVertical ? fontSize * 0.8 : fontSize * 0.85
        lineHeight: adjustedFontSize + 'px',
        letterSpacing: ocrItemBoxVisuals.text.letter_spacing || 'inherit',
        paddingLeft: isVertical ? 0 : '0.25%',
        paddingRight: isVertical ? 0 : '0.25%',
        contentVisibility: 'visible',
        zIndex: 10,
    };

    const Box = styled( BaseOcrResultBox )({            
        "&:hover": activeBoxCss,
        "&.editable": activeBoxCss,
        backgroundColor: ocrItemBoxVisuals.background_color_inactive,
        outlineColor: ocrItemBoxVisuals?.border_color || 'red',
        outlineWidth: ocrItemBoxVisuals?.border_width || '0px',
        borderRadius: ocrItemBoxVisuals?.border_radius || '0rem',
        writingMode: isVertical ? 'vertical-rl' :'inherit',
        textOrientation: isVertical ? 'upright' :'inherit',
        fontSize: fontSize + 'px',
        lineHeight: fontSize + 'px',
        contentVisibility: 'hidden',
        alignItems: alignItems,
        flexDirection: isVertical ? 'row' : 'column',
        justifyContent: isMultiline ? 'space-between' : 'center',
    });

    const { width } = box.dimensions;
    const { left } = box.position;
    const minWidth = width + left > 100 ? 100 - left : width;

    const bottom = 100 - box.position.top - box.dimensions.height;


    useEffect(() => {

        if ( !boxRef?.current || !contentEditable )
            return
        
        boxRef.current.focus();
        
    }, [contentEditable]);
    
    


    return (
        <Box className={ `extracted-text ${contentEditable ? 'editable' : ''}` } ref={boxRef}
            role="textbox"
            style={{
                left: ( isVertical ? left : left - 0.25 ) + '%',
                // top: (box.position.top * 0.999) + '%',
                bottom: bottom + '%',
                transform: `rotate( ${box.angle_degrees}deg )`,
                minWidth: minWidth + '%',
                minHeight: box.dimensions.height + '%',
                paddingLeft: ( isVertical ? 0 : 0.25 ) + '%',
                paddingRight: ( isVertical ? 0 : 0.25 ) + '%',
            }}
            onMouseEnter={ () => props.onMouseEnter( ocrItem ) }
            onMouseLeave={ props.onMouseLeave }
            onClick={ () => props.onClick( ocrItem ) }
            onDoubleClick={ props.onDoubleClick }
            // onBlur={ ( e ) => {
            //     // ocrItem.text = e.target.innerText;
            //     props.onBlur();
            // }}
            suppressContentEditableWarning
        >
            { ocrItem.text.map( ( line, lIdx ) => {

                let lineFontSize = 0;

                line?.symbols.map( symbol => {
                    const charBoxHeightPx = regionHeightPx * ( symbol.box.dimensions.height / 100 );
                    if ( charBoxHeightPx > lineFontSize )
                        lineFontSize = charBoxHeightPx;
                });

                return (
                    <OcrResultLine
                        contentEditable={contentEditable}
                        box={box}
                        line={line}
                        regionWidthPx={regionWidthPx}
                        regionHeightPx={regionHeightPx}
                        key={lIdx}
                        symbolPositioning={ ocrItemBoxVisuals.text.character_positioning }
                        onBlur={props.onBlur}
                    />
                )
            }) }
        </Box>
    )
}