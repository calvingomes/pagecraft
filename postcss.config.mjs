import postcssImport from "postcss-import";
import postcssCustomMedia from "postcss-custom-media";
import path from "node:path";

const projectRoot = process.cwd();

function resolveStyleAlias(id) {
  if (id.startsWith("@styles/")) {
    return path.resolve(projectRoot, "styles", id.slice("@styles/".length));
  }

  if (id.startsWith("@/styles/")) {
    return path.resolve(projectRoot, "styles", id.slice("@/styles/".length));
  }

  return id;
}

const config = {
  plugins: [
    postcssImport({
      resolve: (id) => resolveStyleAlias(id),
    }),
    postcssCustomMedia({
      preserve: false,
    }),
  ],
};

export default config;