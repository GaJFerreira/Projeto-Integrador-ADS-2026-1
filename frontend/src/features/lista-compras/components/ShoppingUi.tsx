import type { ReactNode } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

type Metric = {
    label: string;
    value: string | number;
    tone?: 'primary' | 'success' | 'warning' | 'info';
};

type ShoppingPageProps = {
    children: ReactNode;
    maxWidth?: number;
    sx?: SxProps<Theme>;
};

type ShoppingHeaderProps = {
    eyebrow: string;
    title: string;
    description: string;
    icon: ReactNode;
    actions?: ReactNode;
    metrics?: Metric[];
    onBack?: () => void;
};

type EmptyStateProps = {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
};

const toneColor = (theme: Theme, tone: Metric['tone'] = 'primary') => {
    const colorMap = {
        primary: theme.palette.primary.main,
        success: theme.palette.success.main,
        warning: theme.palette.warning.dark,
        info: theme.palette.info.main,
    };

    return colorMap[tone];
};

export function ShoppingPage({ children, maxWidth = 1120, sx }: ShoppingPageProps) {
    return (
        <Box
            sx={{
                maxWidth,
                mx: 'auto',
                px: { xs: 0, sm: 1 },
                py: { xs: 1, sm: 2 },
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

export function ShoppingHeader({
    eyebrow,
    title,
    description,
    icon,
    actions,
    metrics = [],
    onBack,
}: ShoppingHeaderProps) {
    return (
        <Box
            sx={(theme) => ({
                position: 'relative',
                overflow: 'hidden',
                mb: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.16),
                background:
                    'linear-gradient(135deg, rgba(232,244,255,0.96) 0%, rgba(245,251,247,0.98) 58%, rgba(255,248,232,0.92) 100%)',
            })}
        >
            <Box
                sx={(theme) => ({
                    height: 5,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main}, ${theme.palette.warning.main})`,
                })}
            />

            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {onBack && (
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<ArrowBackIcon />}
                        onClick={onBack}
                        sx={{
                            mb: 2,
                            color: 'text.secondary',
                            px: 0.5,
                            '&:hover': { bgcolor: 'transparent', color: 'primary.main' },
                        }}
                    >
                        Voltar
                    </Button>
                )}

                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2.5}
                    alignItems={{ xs: 'stretch', md: 'flex-start' }}
                    justifyContent="space-between"
                >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Box
                            sx={(theme) => ({
                                width: 58,
                                height: 58,
                                borderRadius: 2,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                                color: theme.palette.primary.main,
                                bgcolor: alpha(theme.palette.common.white, 0.86),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.16),
                                boxShadow: `0 14px 32px ${alpha(theme.palette.primary.main, 0.10)}`,
                                '& svg': { fontSize: 32 },
                            })}
                        >
                            {icon}
                        </Box>

                        <Box>
                            <Chip
                                label={eyebrow}
                                size="small"
                                sx={(theme) => ({
                                    mb: 1,
                                    height: 26,
                                    fontWeight: 800,
                                    color: theme.palette.success.dark,
                                    bgcolor: alpha(theme.palette.success.light, 0.18),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.success.main, 0.22),
                                })}
                            />
                            <Typography
                                variant="h4"
                                fontWeight={900}
                                sx={{
                                    color: 'text.primary',
                                    lineHeight: 1.08,
                                    fontSize: { xs: '1.75rem', sm: '2.2rem' },
                                }}
                            >
                                {title}
                            </Typography>
                            <Typography
                                color="text.secondary"
                                sx={{
                                    mt: 1,
                                    maxWidth: 680,
                                    fontSize: { xs: '0.98rem', sm: '1.04rem' },
                                    lineHeight: 1.55,
                                }}
                            >
                                {description}
                            </Typography>
                        </Box>
                    </Stack>

                    {actions && (
                        <Stack
                            direction={{ xs: 'column', sm: 'row', md: 'column' }}
                            spacing={1}
                            sx={{
                                minWidth: { xs: '100%', md: 188 },
                                alignItems: { xs: 'stretch', sm: 'center', md: 'stretch' },
                            }}
                        >
                            {actions}
                        </Stack>
                    )}
                </Stack>

                {metrics.length > 0 && (
                    <Box
                        sx={{
                            mt: 3,
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, minmax(0, 1fr))',
                                md: `repeat(${metrics.length}, minmax(0, 1fr))`,
                            },
                            gap: 1.2,
                        }}
                    >
                        {metrics.map((metric) => (
                            <Box
                                key={metric.label}
                                sx={(theme) => {
                                    const color = toneColor(theme, metric.tone);
                                    return {
                                        minHeight: 76,
                                        px: 1.6,
                                        py: 1.4,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.common.white, 0.72),
                                        border: '1px solid',
                                        borderColor: alpha(color, 0.2),
                                    };
                                }}
                            >
                                <Typography
                                    sx={(theme) => ({
                                        color: alpha(toneColor(theme, metric.tone), 0.88),
                                        fontWeight: 800,
                                        fontSize: '0.78rem',
                                    })}
                                >
                                    {metric.label}
                                </Typography>
                                <Typography variant="h5" fontWeight={900} sx={{ mt: 0.3 }}>
                                    {metric.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export function SectionTitle({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
            sx={{ mb: 1.5 }}
        >
            <Box>
                <Typography variant="h6" fontWeight={900}>
                    {title}
                </Typography>
                {description && (
                    <Typography color="text.secondary" sx={{ fontSize: '0.94rem' }}>
                        {description}
                    </Typography>
                )}
            </Box>
            {action}
        </Stack>
    );
}

export function EmptyState({
    icon = <Inventory2OutlinedIcon />,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <Box
            sx={(theme) => ({
                py: { xs: 4, sm: 5 },
                px: 2,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: alpha(theme.palette.primary.main, 0.28),
                bgcolor: alpha(theme.palette.primary.light, 0.045),
            })}
        >
            <Box
                sx={(theme) => ({
                    width: 54,
                    height: 54,
                    mx: 'auto',
                    mb: 1.4,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.09),
                    '& svg': { fontSize: 30 },
                })}
            >
                {icon}
            </Box>
            <Typography fontWeight={900}>{title}</Typography>
            <Typography
                color="text.secondary"
                sx={{ mt: 0.5, maxWidth: 420, mx: 'auto', fontSize: '0.95rem' }}
            >
                {description}
            </Typography>
            {action && <Box sx={{ mt: 2 }}>{action}</Box>}
        </Box>
    );
}
