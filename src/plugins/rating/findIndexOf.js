// item -> { type: "", name: "", value: "" }
function findIndexOf(item) {
  function indexOf(type) {
    for (let i = 0; i < global.artifacts.props.length; ++i) {
      if (type === global.artifacts.props[i].type) {
        return i;
      }
    }
  }

  const percentage = item.value.includes("%");
  const numeric = !(percentage || "em" === item.type);
  let index = indexOf(item.type);

  if (
    "number" === typeof index &&
    global.artifacts.props.filter((e) => e.type === item.type).length > 1 &&
    false === numeric
  ) {
    ++index;
  }

  return [index, percentage, numeric]; // index maybe undefined
}

export { findIndexOf };
