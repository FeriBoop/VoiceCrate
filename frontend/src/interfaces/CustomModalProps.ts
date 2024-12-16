/**
 * interface for custom modal window
 */
export interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    headerColor: string;
    bodyColor: string;
    backgroundColor: string;
    duration: number;
}