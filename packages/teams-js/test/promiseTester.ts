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
      return PromiseState.Pending;
    } else {
      return PromiseState.Resolved;
    }
  } catch (e) {
    return PromiseState.Rejected;
  }
}

export async function isPromiseStillPending<T>(promiseInQuestion: Promise<T>): Promise<boolean> {
  return (await getPromiseState(promiseInQuestion)) === PromiseState.Pending;
}
