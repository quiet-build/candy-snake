type Context = { request: Request; next(): Promise<Response> };

export function onRequest(context: Context) {
  if (new URL(context.request.url).hostname !== 'snake.playminiarcade.com') return context.next();
  return Response.redirect('https://playminiarcade.com/game/candy-snake', 301);
}
