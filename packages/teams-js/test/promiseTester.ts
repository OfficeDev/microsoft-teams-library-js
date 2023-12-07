export enum PromiseState {
  Pending = 'pending',
  Resolved = 'resolved',
  Rejected = 'rejected',
}

export async function getPromiseState<T>(promiseInQuestion: Promise<T>): Promise<PromiseState> {
  const objectThatActsLikeAResolvedPromise = {};
  try {
    const firstPromiseNotPending = await Promise.race([promiseInQuestion, objectThatActsLikeAResolvedPromise]);

    if (firstPromiseNotPending === objectThatActsLikeAResolvedPromise) {
      // Promise.race will return the first promise in the given iterable that has settled (either resolved or rejected).
      // If the promise it returned is objectThatActsLikeAResolvedPromise, then we know that the promiseInQuestion is still pending.
      return PromiseState.Pending;
    } else {
      return PromiseState.Resolved;
    }
  } catch (e) {
    // If the promiseInQuestion is rejected, then Promise.race will reject.
    return PromiseState.Rejected;
  }
}

export async function isPromiseStillPending<T>(promiseInQuestion: Promise<T>): Promise<boolean> {
  return (await getPromiseState(promiseInQuestion)) === PromiseState.Pending;
}
