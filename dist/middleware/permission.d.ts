import { Request, Response, NextFunction } from "express";
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MARKETING_EDITOR" | "TECHNICAL_EDITOR" | "VIEWER";
export declare const hasRole: (userRole: string, allowedRoles: UserRole[]) => boolean;
export declare const checkRole: (...allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const superAdminOnly: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const adminOnly: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const editorsOnly: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const marketingEditorAccess: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const technicalEditorAccess: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authenticatedOnly: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=permission.d.ts.map