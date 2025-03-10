{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    bun2nix = {
      url = "github:baileyluTCD/bun2nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };
  };
  outputs = { self, nixpkgs, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        bun2nix = inputs.bun2nix.defaultPackage.${system};
        defaultPackage = pkgs.callPackage ./default.nix { inherit bun2nix; };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = with pkgs; [
            just
            bun
            bun2nix.bin
          ];
        };

        packages = {
          default = defaultPackage;
        };

        apps = {
          default = flake-utils.lib.mkApp {
            drv = defaultPackage;
          };
        };
      }
    );
}
