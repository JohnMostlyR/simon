/**
 * Created by Johan on 25-5-2017.
 */
window.addEventListener('load', function () {
  const model = new window.Simon.Model();
  const view = new window.Simon.View();
  const controller = new window.Simon.Controller(model, view);
  // const game = new window.Simon.Game(controller);

  let i = 1;
  const max = 4;

  let timer = setInterval(function() {
    view.speak(i);

    if (i < max) {
      i += 1;
    } else {
      clearInterval(timer);
    }
  }, 1000);





});
