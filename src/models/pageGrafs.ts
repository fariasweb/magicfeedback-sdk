import {Page} from "./page";
import {PageNode} from "./pageNode";
import {NativeAnswer} from "./types";
import {OperatorType} from "./pageRoute";

export class PageGraph {
    private nodes: Map<string, PageNode>;

    constructor(pages: Page[]) {
        this.nodes = new Map();
        this.buildGraph(pages);
    }

    private buildGraph(pages: Page[]) {
        pages.forEach(page => {
            const node: PageNode = new PageNode(
                page.id,
                page.position,
                page.integrationPageRoutes || [],
                page,
                page.integrationQuestions
            );
            this.nodes.set(node.id, node);
        });
    }

    getNodeById(id: string): PageNode | undefined {
        return this.nodes.get(id);
    }

    /**
     * Get the next page position of the graph given the current page and the answer
     * @param node
     */
    getNextEdgeByDefault(node: PageNode): string | undefined {
        if (!node) return undefined;
        for (const n of this.nodes.values()) {
            if (n.position === (node.position + 1)) return n.id;
        }
        return undefined;
    }

    /**
     * Get the first page of the graph
     * @returns first page
     **/
    getFirstPage(): PageNode | undefined {
        // Find the page with the smallest position
        // TODO: Chek if the graph is completed and don't have break loops
        let firstPage: PageNode | undefined;
        let smallestPosition = Number.MAX_VALUE;
        for (const node of this.nodes.values()) {
            if (node.position < smallestPosition) {
                smallestPosition = node.position;
                firstPage = node;
            }
        }
        return firstPage;
    }

    /**
     * Get the next page of the graph given the current page and the answer
     * @param currentNode
     * @param answer - answer to the question in the current page
     * @returns page
     **/
    getNextPage(currentNode: PageNode, answer: NativeAnswer[]): PageNode | undefined {
        if (!currentNode) {
            return undefined;
        }

        // Order the edges by the type of condition. logical first and direct
        currentNode.edges.sort((a, b) => {
            if (a.typeCondition === 'DIRECT') return 1;
            if (b.typeCondition === 'DIRECT') return -1;
            return 0;
        });

        // Find the first route that matches the condition
        const route = currentNode.edges.find(edge => {
            // Check if the condition is met
            const answerValue = answer?.filter(ans => ans.key === edge.questionRef);
            if (!answerValue) return false;

            if (edge.typeCondition === 'DIRECT') {
                return true;
            } else {
            switch (edge.typeOperator) {
                case OperatorType.EQUAL:
                    return answerValue.find(ans => ans.value?.includes(edge.value));
                case OperatorType.NOEQUAL:
                    return !answerValue.find(ans => ans.value?.includes(edge.value));
                case OperatorType.GREATER:
                    return answerValue.find(ans => ans.value.find(val => Number(val) > Number(edge.value)));
                case OperatorType.LESS:
                    return answerValue.find(ans => ans.value.find(val => Number(val) < Number(edge.value)));
                case OperatorType.GREATEREQUAL:
                    return answerValue.find(ans => ans.value.find(val => Number(val) >= Number(edge.value)));
                case OperatorType.LESSEQUAL:
                    return answerValue.find(ans => ans.value.find(val => Number(val) <= Number(edge.value)));
                case OperatorType.INQ:
                    return answerValue.find(ans => edge.value.includes(ans.value));
                case OperatorType.NINQ:
                    return !answerValue.find(ans => edge.value.includes(ans.value));
                default:
                    return false;
            }
            }
        });

        if (!route) {
            const nextPage = this.getNextEdgeByDefault(currentNode);
            if (!nextPage) return undefined;
            return this.getNodeById(nextPage);
        }

        return this.getNodeById(route.transitionDestiny);
    }


    /**
     * Get the number deep (DFS) of this node
     * @param id - node id
     * @returns DFS number
     */
    findDepth(id: string): number {
        const node = this.getNodeById(id);
        if (!node) {
            return 0;
        }

        const visited: Set<PageNode> = new Set();
        return this.DFSUtil(node, visited, 0);
    }

    findMaxDepth(){
        const visited: Set<PageNode> = new Set()
        let max_depth: number = 0;
        this.nodes.forEach(node => {
            if (!visited.has(node)){
                max_depth = Math.max(max_depth, this.DFSUtil(node, visited, 0))
            }
        } )
        return max_depth
    }

    // A function used by DFS
    DFSUtil(v: PageNode, visited: Set<PageNode>, depth: number) {
        visited.add(v)
        let max_depth = depth
        //Add a default edge to the next page
        const defaultEdge = this.getNextEdgeByDefault(v)

        for (const neighbour of defaultEdge ? [...v.edges, {
            transitionDestiny: defaultEdge,
        }] : v.edges) {
            const node = this.getNodeById(neighbour.transitionDestiny)
            if (node && !visited.has(node)) {
                max_depth = Math.max(max_depth, this.DFSUtil(node, visited, depth + 1))
            }
        }

        return max_depth
    }

    // Other methods for graph traversal, finding paths, etc.
}
