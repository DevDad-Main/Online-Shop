//#region Error Wrapper
export const errorWrapper = (next, err) => {
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
};
//#endregion

export default errorWrapper;
