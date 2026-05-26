import { Request, Response, NextFunction } from "express";
export declare const guardRegisterRole: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const guardUpdateRole: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const guardDeleteUser: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const guardSuperAdminLimit: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=userGuard.d.ts.map