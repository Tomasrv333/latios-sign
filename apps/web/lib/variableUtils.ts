import { EditorBlock } from '../components/editor/Canvas';

export function extractVariables(blocks: EditorBlock[]): string[] {
    const variables = new Set<string>();
    const regex = /\{\{([^}]+)\}\}/g;

    blocks.forEach(block => {
        if (block.type === 'text' && block.content) {
            let match;
            while ((match = regex.exec(block.content)) !== null) {
                variables.add(match[1].trim());
            }
        }
    });

    return Array.from(variables);
}
