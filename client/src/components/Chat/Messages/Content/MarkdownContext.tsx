import { createContext, useContext } from 'react';

interface MarkdownContextType {
  useInternalNavigation: boolean;
}

const MarkdownContext = createContext<MarkdownContextType>({
  useInternalNavigation: false, // default: old behavior
});

export const useMarkdownContext = () => useContext(MarkdownContext);
export default MarkdownContext;
