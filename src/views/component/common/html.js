function html(literals, ...placeholders) {
  let context = "";

  for (let i = 0; i < placeholders.length; ++i) {
    context += literals[i];
    context += placeholders[i].toString();
  }

  return context + literals[literals.length - 1];
}

export { html };
