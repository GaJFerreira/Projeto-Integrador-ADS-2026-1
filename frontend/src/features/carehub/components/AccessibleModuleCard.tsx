import { Card, CardActionArea, CardContent, Typography, Stack, Box, Avatar, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

export function AccessibleModuleCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
}) {
  const theme = useTheme();
  
  return (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: theme.shadows[10],
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        aria-label={title}
        sx={{
          height: '100%',
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          '&.Mui-focusVisible': {
            outline: `4px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
        }}
      >
        <CardContent sx={{ width: '100%', p: '0 !important', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              mb: 2,
              backgroundColor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              '& > svg': { fontSize: 44 }
            }}
          >
            {icon}
          </Avatar>
          <Box sx={{ width: '100%' }}>
            <Typography 
              variant="h5" 
              fontWeight={800} 
              color="text.primary"
              sx={{ mb: 1, fontSize: { xs: '1.25rem', sm: '1.4rem' } }}
            >
              {title}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem' },
                lineHeight: 1.4
              }}
            >
              {description}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
