interface TreeNode {
    key: string;
    label: string;
    data?: any;
    icon?: string;
    children?: TreeNode[];
    expanded?: boolean;
    type?: string;
    size?: string;
    name?: string;
}

type TreeSelectionKeysType = {
    [key: string]: boolean;
};

type TreeTableSelectionKeysType = {
    [key: string]: boolean;
};

const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export type { TreeNode, TreeSelectionKeysType, TreeTableSelectionKeysType, viewport };
