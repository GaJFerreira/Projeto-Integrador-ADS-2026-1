import { forwardRef, useCallback } from 'react';
import {
  MaterialDesignContent,
  closeSnackbar,
  type CustomContentProps,
} from 'notistack';

/**
 * Snackbar padrão: fecha ao clicar (além do auto-hide).
 * MaterialDesignContent não repassa onClick — o wrapper captura o clique.
 */
export const SnackbarClickToDismiss = forwardRef<HTMLDivElement, CustomContentProps>(
  function SnackbarClickToDismiss(props, ref) {
    const { id, style, className, ...contentProps } = props;

    const handleDismiss = useCallback(() => {
      closeSnackbar(id);
    }, [id]);

    return (
      <div
        role="button"
        tabIndex={0}
        title="Clique para fechar"
        className={className}
        style={{ cursor: 'pointer', width: '100%', ...style }}
        onClick={handleDismiss}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleDismiss();
          }
        }}
      >
        <MaterialDesignContent ref={ref} id={id} {...contentProps} />
      </div>
    );
  }
);

const snackbarComponents = {
  default: SnackbarClickToDismiss,
  success: SnackbarClickToDismiss,
  error: SnackbarClickToDismiss,
  warning: SnackbarClickToDismiss,
  info: SnackbarClickToDismiss,
} as const;

export default snackbarComponents;
