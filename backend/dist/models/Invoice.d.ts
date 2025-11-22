import mongoose from 'mongoose';
import { IInvoice } from '../types';
export declare const Invoice: mongoose.Model<IInvoice, {}, {}, {}, mongoose.Document<unknown, {}, IInvoice, {}, {}> & IInvoice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Invoice.d.ts.map