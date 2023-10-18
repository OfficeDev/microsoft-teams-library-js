function stringifyError(err: any): string {
  let errorString = `${err}`;
  if (errorString === '[object Object]') {
    errorString = JSON.stringify(err);
  }
  return errorString;
}
