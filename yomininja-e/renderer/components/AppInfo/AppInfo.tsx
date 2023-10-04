import { useContext, useEffect } from "react";
import { AppInfoContext } from "../../context/app_info.provider";
import { Box, Typography, styled } from "@mui/material";
import Image  from 'next/image';
import Link from "next/link";
import { Stick, Sirin_Stencil } from 'next/font/google'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

const AppNameFont = Stick({ // Stick | Sirin_Stencil
    weight: '400',
    subsets: ['latin'],
})

const AppNameFirstLetter = styled('span')({
    marginRight: -3,
});

const AboutText = styled(Typography)({
    marginTop: '0.3rem',
    marginBottom: '0.3rem',
    fontSize: '1.2rem'
});

export default function AppInfo() {

    const { versionInfo, runUpdateCheck } = useContext( AppInfoContext );
    
    const githubReleasesLink = (
        <Link href='#'
            style={{ color: 'white' }}
            onClick={ () => global.ipcRenderer.invoke('app_info:open_releases_page') }
            >
            GitHub
        </Link>
    )

    let versionText = 'Version: '+ versionInfo.runningVersion;
    versionText +=  versionInfo.isUpToDate ? ' (latest)' : '';

    let newVersionText: string | undefined = versionInfo.isUpToDate ? undefined : 'Newer version available on ';

    const logoDarkSrc = '/logos/v1-alt-3.svg';

    const size = 300;
    const width = size;
    const height = size;

   

    const AppName = ( props ) => (
        <Typography variant="h4" mb={1} {...props}>
            <AppNameFirstLetter className={AppNameFont.className}>Y</AppNameFirstLetter>omi Ninja
        </Typography>
    );

    useEffect( () => {
        runUpdateCheck();
    }, [])
    

    return(
        <>
            <Box display='flex' flexDirection='row' justifyContent='center' padding={10}>
                <Image
                    src= {logoDarkSrc}
                    width={width}
                    height={height}
                    priority={true}
                    alt=""
                    style={{
                        backgroundColor: 'white', // #929397
                        borderRadius: '100%'
                    }}
                />

                <Box display='flex' flexDirection='column' justifyContent='center' ml={5}>

                    <Box>
                        <AppName/>                                            
                        <AboutText sx={{ mb: 0 }} >
                            {versionText}
                        </AboutText>
                        <AboutText sx={{ mt: 0 }}>
                            ✨{newVersionText}{githubReleasesLink}.
                        </AboutText>
                    </Box>

                    <AboutText> Yomi Ninja provides seamless text extraction right from your screen,
                    making it easy to copy text from images, videos, and games without switching applications.</AboutText>

                    {/* <P> Perfect for language learners and anyone who values efficient text handling. </P> */}
                    <AboutText> Dictionary look-ups with a simple hover and other features are coming soon. </AboutText>
                  
                </Box>
                
            </Box>
                        
        </>
    )
}