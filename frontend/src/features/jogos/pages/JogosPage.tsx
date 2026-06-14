/// src/pages/JogosPage.tsx
import React from "react";

import {
    Typography,
    Card,
    CardContent,
    Container,
    CardActionArea,
    CardMedia,
    Grid,
    Box,
    Button,
} from "@mui/material";

import vacaVsOvni from "../../../assets/vaca_vs_ovni.png";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from 'react-router-dom';

type Jogo = {
    nome: string;
    imagem: string;
    link: string;
};


const jogos: Jogo[] = [
    {
        nome: "Vaca vs Ovni",
        imagem: vacaVsOvni,
        link: "https://1drv.ms/f/c/a2639b7dc27c60fc/IgAABklKhSFWTpksHMVO0-VMAaJfwpk59i3sOMcsj5IG-S0",
    },


];

const JogosPage: React.FC = () => {
    const abrirLink = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };
    const navigate = useNavigate();

    return (
        <Container
            maxWidth="md"
            sx={{
                py: 3,
                minHeight: "calc(100vh - 64px)",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    background: "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    borderRadius: 4,
                    p: { xs: 1, sm: 2 },
                    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                }}
            >
                <CardContent>

                    {/*Botão Voltar */}
                    <Box display="flex" alignItems="center" mb={2}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/home')}
                            sx={{
                                textTransform: 'none',
                                color: 'primary.main',
                                fontWeight: 600,
                                mb: 1,
                            }}
                        >
                            Voltar
                        </Button>
                    </Box>

                    <Typography
                        variant="h4"
                        sx={{
                            mb: 2,
                            textAlign: "center",
                            fontWeight: 700,
                            color: "primary.main",
                        }}
                    >
                         Jogos
                    </Typography>

                    <Grid container spacing={2} justifyContent="center">
                        {jogos.map((jogo, index) => (
                            <Grid item xs={12} sm={3} md={2} key={index}>
                                <Card
                                    sx={{
                                        width: 220,
                                        mx: "auto",
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: 2,
                                        transition: "0.3s",
                                        "&:hover": {
                                            transform: "translateY(-5px)",
                                            boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                                        },
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => abrirLink(jogo.link)}
                                        sx={{
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "stretch",
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={jogo.imagem}
                                            alt={jogo.nome}
                                            sx={{
                                                objectFit: "cover",
                                            }}
                                        />

                                        <Box sx={{ p: 2, flexGrow: 1 }}>
                                            <Typography
                                                variant="h6"
                                                textAlign="center"
                                                fontWeight={500}
                                                gutterBottom
                                            >
                                                {jogo.nome}
                                            </Typography>

                                        </Box>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};

export default JogosPage;