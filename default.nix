{ bun2nix, pkgs, lib, ... }:

let
  packageJson = lib.importJSON ./package.json;
  version = packageJson.version;
  name = packageJson.name;
in

bun2nix.mkBunDerivation rec {
  inherit name version;

  src = ./.;
  bunNix = ./bun.nix;
  nativeBuildInputs = with pkgs; [ bun rsync makeBinaryWrapper ];
  buildInputs = with pkgs; [ bun ];

  buildPhase = ''
    runHook preBuild
    bun build \
      --target=node \
      --splitting \
      --external react-devtools-core \
      ./src/index.ts \
      --outdir=./build
    runHook postBuild
  '';

  installPhase = with pkgs; ''
    runHook preInstall
    mkdir -p $out/bin $out/share/ticktick-tui
    cp -R ./build/* $out/share/ticktick-tui/
    cp ./node_modules/yoga-wasm-web/dist/yoga.wasm $out/share/ticktick-tui/yoga.wasm
    cat <<EOF > $out/bin/ticktick-tui
    #!/bin/sh
    ${bun}/bin/bun run $out/share/ticktick-tui/index.js
    EOF
    chmod +x $out/bin/ticktick-tui
    runHook postInstall
  '';
}
