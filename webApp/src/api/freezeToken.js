import { MidLoader } from "../components/loaders/midLoader"
import { createRoot } from 'react-dom/client';
import { ErrComp } from "../components/loaders/errComponent";

const domNode = document.getElementById('footer');
const root = createRoot(domNode);

export const freezeToken = () => {
    console.log('cheack')
    root.render(<ErrComp/>);
}
