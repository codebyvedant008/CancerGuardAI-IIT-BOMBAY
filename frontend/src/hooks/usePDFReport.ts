import { useState } from 'react';
import { toast } from 'react-hot-toast';

export function usePDFReport(_ref: any, _filename: string) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Opening print dialog...');
    try {
      // Small delay to ensure the report component is fully rendered
      await new Promise(resolve => setTimeout(resolve, 300));
      window.print();
      toast.success('Use "Save as PDF" in the print dialog!', { id: toastId, duration: 5000 });
    } catch {
      toast.error('Could not open print dialog.', { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePDF, isGenerating };
}
