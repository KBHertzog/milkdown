import type { MarkType, NodeType, Schema } from 'prosemirror-model';
import type { Attrs, InnerParserSpecMap, MarkdownNode, ParserSpecWithType } from '.';
import type { Stack } from './stack';
import type { RemarkParser } from '../internal-plugin';

type PS<T extends keyof Stack> = Parameters<Stack[T]>;

export class State {
    constructor(
        private readonly stack: Stack,
        public readonly schema: Schema,
        private readonly specMap: InnerParserSpecMap,
    ) {}

    #matchTarget(node: MarkdownNode): ParserSpecWithType {
        const result = Object.values(this.specMap).find((x) => x.match(node));

        if (!result) throw new Error();

        return result;
    }

    #runNode(node: MarkdownNode) {
        const { key, runner, is } = this.#matchTarget(node);

        const proseType: NodeType | MarkType = this.schema[is === 'node' ? 'nodes' : 'marks'][key];
        runner(this, node, proseType as NodeType & MarkType);
    }

    run = async (remark: RemarkParser, markdown: string) => {
        const tree = (await remark.run(remark.parse(markdown))) as MarkdownNode;
        this.next(tree);

        return this;
    };

    injectRoot = (node: MarkdownNode, nodeType: NodeType, attrs?: Attrs) => {
        this.stack.openNode(nodeType, attrs);
        this.next(node.children);

        return this;
    };

    addText = (text = '') => {
        this.stack.addText((marks) => this.schema.text(text, marks));
        return this;
    };

    addNode = (...args: PS<'addNode'>) => {
        this.stack.addNode(...args);
        return this;
    };

    openNode = (...args: PS<'openNode'>) => {
        this.stack.openNode(...args);
        return this;
    };

    closeNode = (...args: PS<'closeNode'>) => {
        this.stack.closeNode(...args);
        return this;
    };

    openMark = (...args: PS<'openMark'>) => {
        this.stack.openMark(...args);
        return this;
    };

    closeMark = (...args: PS<'closeMark'>) => {
        this.stack.closeMark(...args);
        return this;
    };

    toDoc = () => this.stack.build();

    next = (nodes: MarkdownNode | MarkdownNode[] = []) => {
        [nodes].flat().forEach((node) => this.#runNode(node));
        return this;
    };
}
