var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const getAllGenData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resp = yield fetch(`../api/generators/get`, {
            method: "get",
        });
        const respJSON = yield resp.json();
        return respJSON;
    }
    catch (e) {
        console.error(e);
        return null;
    }
});
export const getSchData = (genId, schType, revNo, startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resp = yield fetch(`../api/schVsOpt/${genId}/${schType}/${revNo}/${startDate}/${endDate}`, {
            method: "get",
        });
        const respJSON = yield resp.json();
        return respJSON;
    }
    catch (e) {
        console.error(e);
        return null;
    }
});
//# sourceMappingURL=fetchDataApi.js.map