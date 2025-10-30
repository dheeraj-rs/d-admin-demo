type ClassDictionary = Record<string, boolean>;

type ClassArray = Array<ClassValue>;

type ClassValue = string | number | ClassDictionary | ClassArray | undefined | null;

export type { ClassDictionary, ClassArray, ClassValue };
