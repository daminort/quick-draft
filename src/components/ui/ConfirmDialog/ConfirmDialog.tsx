import { AlertDialog, Button, Flex } from '@radix-ui/themes';

type TConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: TConfirmDialogProps) {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={next => !next && onCancel()}>
      <AlertDialog.Content maxWidth="320px">
        <AlertDialog.Title>{title}</AlertDialog.Title>
        <AlertDialog.Description size="2">{message}</AlertDialog.Description>
        <Flex justify="end" gap="3" mt="4">
          <AlertDialog.Cancel>
            <Button onClick={onCancel} variant="soft" color="gray">
              {cancelLabel}
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button onClick={onConfirm} variant="solid" color="red">
              {confirmLabel}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
