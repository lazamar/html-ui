const { init, h, text } = SMVC;

const colours = Array.from({ length: 200 }).map(_ => {
  const r = Math.ceil(Math.random() * 255);
  const g = Math.ceil(Math.random() * 255);
  const b = Math.ceil(Math.random() * 255);
  return `rgb(${r}, ${g}, ${b})`
});

function randomColour() {
  const choice = Math.floor(Math.random() * colours.length);
  return colours[choice];
}

function update({ nodes, scrollPosition, scrollDifference }, msg, enqueue) {
  switch (Object.keys(msg)[0]) {
  case "ScrollEvent": {
      const { ScrollEvent: newScrollPosition } = msg;
      return {
        nodes,
        scrollPosition: newScrollPosition ,
        scrollDifference: newScrollPosition - scrollPosition
      };
  }
  case "Repaint":
      enqueue({ Repaint: true })
      for (let i = 0; i < nodes.length; i += Math.ceil(Math.random() * 200)) {
        nodes[i] = randomColour();
      }
      return { scrollPosition, scrollDifference, nodes };
  }
}

function view({ nodes, scrollPosition, scrollDifference }) {
  const nodeWidth = 10;
  const rowHeight = 10;
  const rowLength = 100;
  const totalHeight = Math.ceil(nodes.length / rowLength) * rowHeight;

  const elsInVerticalSpace = height => rowLength * Math.ceil(height / rowHeight);

  const minElInView = elsInVerticalSpace(scrollPosition);
  const maxElInView = minElInView + elsInVerticalSpace(window.innerHeight);

  const totalInView = maxElInView - minElInView;
  const bufferTop = scrollDifference < 0 ? totalInView : 0;
  const bufferBottom = scrollDifference >= 0 ? totalInView : 0;

  const totalToRender = totalInView * 2;

  const minElToRender = Math.min(nodes.length - totalToRender, minElInView - bufferTop);
  const maxElToRender = Math.max(totalToRender, maxElInView + bufferBottom);

  const squares = [];
  for (let ix = Math.max(0, minElToRender); ix < Math.min(nodes.length, maxElToRender); ix++) {
      const top = Math.floor(ix / rowLength) * rowHeight;
      const left = (ix % rowLength) * nodeWidth;
      const colour = nodes[ix];
      const style = `
        background-color: ${colour};
        transform: translate(${left}px, ${top}px);`;
      const element = h("span", { style: style }, []);
      squares.push(element);
  }

  return [
    h("section", { onScroll: e => ({ ScrollEvent: e.target.scrollTop }) }, [
      h("div", { style: `position: absolute; height: ${totalHeight}px`}, squares)
    ])
  ];
}

const node_count = 1_000_000;
const nodes = [];
for (let i = 0; i < node_count; i++) {
  nodes.push(randomColour());
}
const root = document.querySelector("main");
const initialState = { nodes, scrollPosition: 0, scrollDifference: 0 };
const { enqueue } = init(root, initialState, update, view);
enqueue({ Repaint: true })
