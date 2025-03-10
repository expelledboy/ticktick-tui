# This file was autogenerated by `bun2nix`, editing it is not recommended.
# Consume it with `callPackage` in your actual derivation -> https://nixos-and-flakes.thiscute.world/nixpkgs/callpackage
{
  lib,
  fetchurl,
  gnutar,
  coreutils,
  runCommand,
  symlinkJoin,
  bun,
}: let
  # Bun packages to install
  packages = [
    {
      name = "@alcalzone/ansi-tokenize";
      path = fetchurl {
        name = "@alcalzone/ansi-tokenize@0.1.3";
        url  = "https://registry.npmjs.org/@alcalzone/ansi-tokenize/-/ansi-tokenize-0.1.3.tgz";
        hash = "sha256-WLY9XIhRXVdlQYo8Ts5bdVh46JcQ7zzu61vps7iVCrQ=";
      };
    }
    {
      name = "@tanstack/query-core";
      path = fetchurl {
        name = "@tanstack/query-core@5.67.2";
        url  = "https://registry.npmjs.org/@tanstack/query-core/-/query-core-5.67.2.tgz";
        hash = "sha256-O6jYqD1OcyKtJINxmpT48uhkh9Spo00JogL85bfdX/0=";
      };
    }
    {
      name = "@tanstack/query-persist-client-core";
      path = fetchurl {
        name = "@tanstack/query-persist-client-core@5.67.2";
        url  = "https://registry.npmjs.org/@tanstack/query-persist-client-core/-/query-persist-client-core-5.67.2.tgz";
        hash = "sha256-cvJbNYtUThzSzYBQT3g27vaMHIE8M44j2Fj+AQxYC6I=";
      };
    }
    {
      name = "@tanstack/query-sync-storage-persister";
      path = fetchurl {
        name = "@tanstack/query-sync-storage-persister@5.67.2";
        url  = "https://registry.npmjs.org/@tanstack/query-sync-storage-persister/-/query-sync-storage-persister-5.67.2.tgz";
        hash = "sha256-611nL/3lCrd1SuZ/ktZ6waF9uzKVY6u5Y3u2jERWTlw=";
      };
    }
    {
      name = "@tanstack/react-query";
      path = fetchurl {
        name = "@tanstack/react-query@5.67.2";
        url  = "https://registry.npmjs.org/@tanstack/react-query/-/react-query-5.67.2.tgz";
        hash = "sha256-O0Sq0QA/Xoy8dz69ZW7zuIGp/gdPCjyYCPbR/670M6E=";
      };
    }
    {
      name = "@tanstack/react-query-persist-client";
      path = fetchurl {
        name = "@tanstack/react-query-persist-client@5.67.2";
        url  = "https://registry.npmjs.org/@tanstack/react-query-persist-client/-/react-query-persist-client-5.67.2.tgz";
        hash = "sha256-X+D8ZEP4/1bQVgL4K3YD3GqAESbd/xV3fVZUYJUgLaE=";
      };
    }
    {
      name = "@types/bun";
      path = fetchurl {
        name = "@types/bun@1.2.4";
        url  = "https://registry.npmjs.org/@types/bun/-/bun-1.2.4.tgz";
        hash = "sha256-O01ctlMKEB5nmokJir6UwrPEPWaW9zhiqS0YkwPVX9Y=";
      };
    }
    {
      name = "@types/node";
      path = fetchurl {
        name = "@types/node@22.13.10";
        url  = "https://registry.npmjs.org/@types/node/-/node-22.13.10.tgz";
        hash = "sha256-kfvpelaL2E4V/oBZecL0az0YjiKMXlko7ilcsYSGUMk=";
      };
    }
    {
      name = "@types/ws";
      path = fetchurl {
        name = "@types/ws@8.5.14";
        url  = "https://registry.npmjs.org/@types/ws/-/ws-8.5.14.tgz";
        hash = "sha256-SsUn5egoHI/5PcxHQwwtNupaBcwgePqjR3uTG7Ew37w=";
      };
    }
    {
      name = "ansi-escapes";
      path = fetchurl {
        name = "ansi-escapes@7.0.0";
        url  = "https://registry.npmjs.org/ansi-escapes/-/ansi-escapes-7.0.0.tgz";
        hash = "sha256-XGbGPRgwTTM081zAvRNh2UpRriDNQ2E/pCdYvd4p+uk=";
      };
    }
    {
      name = "ansi-regex";
      path = fetchurl {
        name = "ansi-regex@6.1.0";
        url  = "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.1.0.tgz";
        hash = "sha256-BG9v4XYCtoaqUi3hk9YEanXlV5MzZbpR4+PY4fppTzw=";
      };
    }
    {
      name = "ansi-styles";
      path = fetchurl {
        name = "ansi-styles@6.2.1";
        url  = "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.1.tgz";
        hash = "sha256-aPDnPT8um3lKOI3H9OmhmCcCc6C8pIzWjc+eCM88XRg=";
      };
    }
    {
      name = "auto-bind";
      path = fetchurl {
        name = "auto-bind@5.0.1";
        url  = "https://registry.npmjs.org/auto-bind/-/auto-bind-5.0.1.tgz";
        hash = "sha256-xKF+AUuEsEjNNrVg3o1Ug9B4l6vhYmEALMPP2KL3iVo=";
      };
    }
    {
      name = "bun-types";
      path = fetchurl {
        name = "bun-types@1.2.4";
        url  = "https://registry.npmjs.org/bun-types/-/bun-types-1.2.4.tgz";
        hash = "sha256-lXqzNu+EFE1bzON4rLGrSdws76vuyStC1Ehxa3n/6/0=";
      };
    }
    {
      name = "bundle-name";
      path = fetchurl {
        name = "bundle-name@4.1.0";
        url  = "https://registry.npmjs.org/bundle-name/-/bundle-name-4.1.0.tgz";
        hash = "sha256-NeSdQkDJHL5MopkmE5/uqEgwLp7qMX8x2egblyzpCRE=";
      };
    }
    {
      name = "chalk";
      path = fetchurl {
        name = "chalk@5.4.1";
        url  = "https://registry.npmjs.org/chalk/-/chalk-5.4.1.tgz";
        hash = "sha256-hLi584anZ4H0SCJ5r0LRMbqFIxU4hkOZnhX5W0f/0No=";
      };
    }
    {
      name = "cli-boxes";
      path = fetchurl {
        name = "cli-boxes@3.0.0";
        url  = "https://registry.npmjs.org/cli-boxes/-/cli-boxes-3.0.0.tgz";
        hash = "sha256-ZiCTXzVii10gobMnA0WSjaEbAqctN7uwsaCUdPl7Tzk=";
      };
    }
    {
      name = "cli-cursor";
      path = fetchurl {
        name = "cli-cursor@4.0.0";
        url  = "https://registry.npmjs.org/cli-cursor/-/cli-cursor-4.0.0.tgz";
        hash = "sha256-a9x0UvwLG8v0U0q1+36CKV+V/8if1KwPnyhr4Vi5MKs=";
      };
    }
    {
      name = "cli-truncate";
      path = fetchurl {
        name = "cli-truncate@4.0.0";
        url  = "https://registry.npmjs.org/cli-truncate/-/cli-truncate-4.0.0.tgz";
        hash = "sha256-KTo6A9xkdBU/qz/RxBrHTd33PSwWLJRhLz8oK6z4viI=";
      };
    }
    {
      name = "code-excerpt";
      path = fetchurl {
        name = "code-excerpt@4.0.0";
        url  = "https://registry.npmjs.org/code-excerpt/-/code-excerpt-4.0.0.tgz";
        hash = "sha256-IBFZViP698majpA6Gfy3CDPuyTp3wwPIbShfem8bQQQ=";
      };
    }
    {
      name = "convert-to-spaces";
      path = fetchurl {
        name = "convert-to-spaces@2.0.1";
        url  = "https://registry.npmjs.org/convert-to-spaces/-/convert-to-spaces-2.0.1.tgz";
        hash = "sha256-iFCNGWOAcs7w8o/Z2lZ5rOBhh8YbntJ1QaxTUVsL/kA=";
      };
    }
    {
      name = "default-browser";
      path = fetchurl {
        name = "default-browser@5.2.1";
        url  = "https://registry.npmjs.org/default-browser/-/default-browser-5.2.1.tgz";
        hash = "sha256-zpuJjd8K4je3IadkrsY0pvfYtqdnetK9VNTq3idlp2Q=";
      };
    }
    {
      name = "default-browser-id";
      path = fetchurl {
        name = "default-browser-id@5.0.0";
        url  = "https://registry.npmjs.org/default-browser-id/-/default-browser-id-5.0.0.tgz";
        hash = "sha256-X8RSmunv0GcfQBUSWqtSCEeTtZf2HDlU08t8oxPr7U4=";
      };
    }
    {
      name = "define-lazy-prop";
      path = fetchurl {
        name = "define-lazy-prop@3.0.0";
        url  = "https://registry.npmjs.org/define-lazy-prop/-/define-lazy-prop-3.0.0.tgz";
        hash = "sha256-u+n+Z6Ipxk/5uMd6zhInji1EBIoqWvluX8lau8lMSbU=";
      };
    }
    {
      name = "emoji-regex";
      path = fetchurl {
        name = "emoji-regex@10.4.0";
        url  = "https://registry.npmjs.org/emoji-regex/-/emoji-regex-10.4.0.tgz";
        hash = "sha256-uN4xAqKX53jV6X8VFKN0p6Vlgpxr0aMnqtJfn/H1mzs=";
      };
    }
    {
      name = "environment";
      path = fetchurl {
        name = "environment@1.1.0";
        url  = "https://registry.npmjs.org/environment/-/environment-1.1.0.tgz";
        hash = "sha256-sssP3ob4DX118kNUVlBf1ot5EqppGKKpZDubgpV2gX8=";
      };
    }
    {
      name = "es-toolkit";
      path = fetchurl {
        name = "es-toolkit@1.32.0";
        url  = "https://registry.npmjs.org/es-toolkit/-/es-toolkit-1.32.0.tgz";
        hash = "sha256-Ttsbmx6e5Xyg6TgCR1aGPXFRaptHgk0o3+DqnCbPZS8=";
      };
    }
    {
      name = "escape-string-regexp";
      path = fetchurl {
        name = "escape-string-regexp@2.0.0";
        url  = "https://registry.npmjs.org/escape-string-regexp/-/escape-string-regexp-2.0.0.tgz";
        hash = "sha256-ddjbwfaX9R2LDbTUgOjbToJUhlMTZcAdCYJ587TTOxY=";
      };
    }
    {
      name = "get-east-asian-width";
      path = fetchurl {
        name = "get-east-asian-width@1.3.0";
        url  = "https://registry.npmjs.org/get-east-asian-width/-/get-east-asian-width-1.3.0.tgz";
        hash = "sha256-J8X/NjSphheq4dn4ZHIMT+jhzYyxNt4SMEDnTCsVxAw=";
      };
    }
    {
      name = "indent-string";
      path = fetchurl {
        name = "indent-string@5.0.0";
        url  = "https://registry.npmjs.org/indent-string/-/indent-string-5.0.0.tgz";
        hash = "sha256-3USK2uU0LnZIPWnE/3RR6/DhoW8QRFq/RSR8gV6b9+Y=";
      };
    }
    {
      name = "ink";
      path = fetchurl {
        name = "ink@5.1.1";
        url  = "https://registry.npmjs.org/ink/-/ink-5.1.1.tgz";
        hash = "sha256-tjA1T/W5hXhWi3UhbaZYaGyY+JOF8+xip089D29niYE=";
      };
    }
    {
      name = "is-docker";
      path = fetchurl {
        name = "is-docker@3.0.0";
        url  = "https://registry.npmjs.org/is-docker/-/is-docker-3.0.0.tgz";
        hash = "sha256-GiMLCyXIHv8Gve44VqdC/RcmAWmwv5WN6TaMSzzi3e4=";
      };
    }
    {
      name = "is-fullwidth-code-point";
      path = fetchurl {
        name = "is-fullwidth-code-point@4.0.0";
        url  = "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-4.0.0.tgz";
        hash = "sha256-mo2rWl3bilpMDDb+MNRn4+8fc43BzRL+93MhLtcpHNY=";
      };
    }
    {
      name = "is-fullwidth-code-point";
      path = fetchurl {
        name = "is-fullwidth-code-point@5.0.0";
        url  = "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-5.0.0.tgz";
        hash = "sha256-XjgKW6S+ju8EdQYz6XcWhw/J8Qk2pow435KcU7yRexU=";
      };
    }
    {
      name = "is-in-ci";
      path = fetchurl {
        name = "is-in-ci@1.0.0";
        url  = "https://registry.npmjs.org/is-in-ci/-/is-in-ci-1.0.0.tgz";
        hash = "sha256-YvJFXIZypNT7E0wA4J46Dd0Qd3cEEwq4XbeDtuVk2uQ=";
      };
    }
    {
      name = "is-inside-container";
      path = fetchurl {
        name = "is-inside-container@1.0.0";
        url  = "https://registry.npmjs.org/is-inside-container/-/is-inside-container-1.0.0.tgz";
        hash = "sha256-296VuENPxHV2JJdNQTnE8yOR0IxBU1Za6RpfP9dy4Hs=";
      };
    }
    {
      name = "is-wsl";
      path = fetchurl {
        name = "is-wsl@3.1.0";
        url  = "https://registry.npmjs.org/is-wsl/-/is-wsl-3.1.0.tgz";
        hash = "sha256-3DyuZ7xkGkETKJVNMwaOPcmC5PNrUkECExu34c77ArI=";
      };
    }
    {
      name = "js-tokens";
      path = fetchurl {
        name = "js-tokens@4.0.0";
        url  = "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz";
        hash = "sha256-2ITHotittVaMEnLZK0+cYnB/QibPnnsi57lXxzYePFM=";
      };
    }
    {
      name = "loose-envify";
      path = fetchurl {
        name = "loose-envify@1.4.0";
        url  = "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz";
        hash = "sha256-EhiDCpNTik9zDVMBOOlF6mpltF4Jnuep6lOKBRQbq9w=";
      };
    }
    {
      name = "mimic-fn";
      path = fetchurl {
        name = "mimic-fn@2.1.0";
        url  = "https://registry.npmjs.org/mimic-fn/-/mimic-fn-2.1.0.tgz";
        hash = "sha256-6nBcJhSGxO8qjJNrFZyGrR10Udevx7f5fMLRgFwEZr8=";
      };
    }
    {
      name = "onetime";
      path = fetchurl {
        name = "onetime@5.1.2";
        url  = "https://registry.npmjs.org/onetime/-/onetime-5.1.2.tgz";
        hash = "sha256-8Fmy6oAct7JTxGE/Q9ls1Wro3aVvqgmZU5qheVclqs0=";
      };
    }
    {
      name = "open";
      path = fetchurl {
        name = "open@10.1.0";
        url  = "https://registry.npmjs.org/open/-/open-10.1.0.tgz";
        hash = "sha256-PM2rTz6gUyKbi7fZg0x5F4CAyfo1WtV1see2I2CsulE=";
      };
    }
    {
      name = "patch-console";
      path = fetchurl {
        name = "patch-console@2.0.0";
        url  = "https://registry.npmjs.org/patch-console/-/patch-console-2.0.0.tgz";
        hash = "sha256-oW2LMZHl5dCWdmjolMWSx54vPjMHhuNhhmhDMLo8t2c=";
      };
    }
    {
      name = "react";
      path = fetchurl {
        name = "react@18.3.1";
        url  = "https://registry.npmjs.org/react/-/react-18.3.1.tgz";
        hash = "sha256-jZvtAaZy5+rzh5QteBrUfGpDCJowoDBgYPn9WseHA0c=";
      };
    }
    {
      name = "react-reconciler";
      path = fetchurl {
        name = "react-reconciler@0.29.2";
        url  = "https://registry.npmjs.org/react-reconciler/-/react-reconciler-0.29.2.tgz";
        hash = "sha256-g0qou3F9TnLf/wrGkd5WCuZ97CP/lZ7Tty89Mf1tSiA=";
      };
    }
    {
      name = "restore-cursor";
      path = fetchurl {
        name = "restore-cursor@4.0.0";
        url  = "https://registry.npmjs.org/restore-cursor/-/restore-cursor-4.0.0.tgz";
        hash = "sha256-2ZrWWneY0u4PocgNPEtFAsEcdSFRgDkMNF3DhZiK9gc=";
      };
    }
    {
      name = "run-applescript";
      path = fetchurl {
        name = "run-applescript@7.0.0";
        url  = "https://registry.npmjs.org/run-applescript/-/run-applescript-7.0.0.tgz";
        hash = "sha256-Zxa9ro/sNDUpCR1LcQkKDww6qkDjSX1Bu3a4qaq/dek=";
      };
    }
    {
      name = "scheduler";
      path = fetchurl {
        name = "scheduler@0.23.2";
        url  = "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz";
        hash = "sha256-5PHY/mOpq5PvZskrCtGvnBMmrb9/G9XpBTysD+5vJq4=";
      };
    }
    {
      name = "signal-exit";
      path = fetchurl {
        name = "signal-exit@3.0.7";
        url  = "https://registry.npmjs.org/signal-exit/-/signal-exit-3.0.7.tgz";
        hash = "sha256-Q5Yj+mqrkWAGFex1fqoTf8q0DTs13aON90RMFWePIKg=";
      };
    }
    {
      name = "slice-ansi";
      path = fetchurl {
        name = "slice-ansi@5.0.0";
        url  = "https://registry.npmjs.org/slice-ansi/-/slice-ansi-5.0.0.tgz";
        hash = "sha256-6T2HzQYFiXhUiVxi4AmlMIUxmGXc/ECC+c3BHNcSnxY=";
      };
    }
    {
      name = "slice-ansi";
      path = fetchurl {
        name = "slice-ansi@7.1.0";
        url  = "https://registry.npmjs.org/slice-ansi/-/slice-ansi-7.1.0.tgz";
        hash = "sha256-HSG/Y/fNGaSoNV4iBZo/DGJbONf7rTRK6VJwggS3ZBg=";
      };
    }
    {
      name = "stack-utils";
      path = fetchurl {
        name = "stack-utils@2.0.6";
        url  = "https://registry.npmjs.org/stack-utils/-/stack-utils-2.0.6.tgz";
        hash = "sha256-6zKoUas4DqCU1HLYBOhBbN8KQ8exJDzSdCLI0BEpLv8=";
      };
    }
    {
      name = "string-width";
      path = fetchurl {
        name = "string-width@7.2.0";
        url  = "https://registry.npmjs.org/string-width/-/string-width-7.2.0.tgz";
        hash = "sha256-PpCQGpjK3vaYb+KVPm0YH0lzDYHHhVd2pjN/75O78fM=";
      };
    }
    {
      name = "strip-ansi";
      path = fetchurl {
        name = "strip-ansi@7.1.0";
        url  = "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.0.tgz";
        hash = "sha256-lMSjCUaQVYsbBvVFG8OAGW0taEsolTdjNUIcFXqzk3E=";
      };
    }
    {
      name = "type-fest";
      path = fetchurl {
        name = "type-fest@4.37.0";
        url  = "https://registry.npmjs.org/type-fest/-/type-fest-4.37.0.tgz";
        hash = "sha256-v9C4PvScHgOuG3hN0DcfXHaynA3JGlzvyMdB1oRGcqM=";
      };
    }
    {
      name = "typescript";
      path = fetchurl {
        name = "typescript@5.8.2";
        url  = "https://registry.npmjs.org/typescript/-/typescript-5.8.2.tgz";
        hash = "sha256-75OKRTI99XdWZOpdVei8CrICekDbH/hXu5V/57uqRDQ=";
      };
    }
    {
      name = "undici-types";
      path = fetchurl {
        name = "undici-types@6.20.0";
        url  = "https://registry.npmjs.org/undici-types/-/undici-types-6.20.0.tgz";
        hash = "sha256-coyp/P9nY3Lk3NZIteJvu9sonsK89nXnYBzCE0pejW4=";
      };
    }
    {
      name = "widest-line";
      path = fetchurl {
        name = "widest-line@5.0.0";
        url  = "https://registry.npmjs.org/widest-line/-/widest-line-5.0.0.tgz";
        hash = "sha256-Rb9GOdj60s8l3gfOsWxw8n32LW9b6zki5Vs5iZVHcK4=";
      };
    }
    {
      name = "wrap-ansi";
      path = fetchurl {
        name = "wrap-ansi@9.0.0";
        url  = "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-9.0.0.tgz";
        hash = "sha256-5DEN+wvv/dQk+KJ1uLxWV7AN9CHgZPewEXHKcdo9kHI=";
      };
    }
    {
      name = "ws";
      path = fetchurl {
        name = "ws@8.18.1";
        url  = "https://registry.npmjs.org/ws/-/ws-8.18.1.tgz";
        hash = "sha256-1DybgsiOWE7KOvYK07wktGkNsVdgzCApeqIPJuWB3pY=";
      };
    }
    {
      name = "yoga-wasm-web";
      path = fetchurl {
        name = "yoga-wasm-web@0.3.3";
        url  = "https://registry.npmjs.org/yoga-wasm-web/-/yoga-wasm-web-0.3.3.tgz";
        hash = "sha256-Q+mSZAjlURbiZ/LoXRn43z5JLoYWz+DiBoQ//BRhLWc=";
      };
    }
    {
      name = "zod";
      path = fetchurl {
        name = "zod@3.24.2";
        url  = "https://registry.npmjs.org/zod/-/zod-3.24.2.tgz";
        hash = "sha256-82WgSb0fzDB56R2cvPlot63OcFZiv7PKGrOTDAOy7eM=";
      };
    }
    {
      name = "zustand";
      path = fetchurl {
        name = "zustand@5.0.3";
        url  = "https://registry.npmjs.org/zustand/-/zustand-5.0.3.tgz";
        hash = "sha256-FtqMwc0otNmtAhbT5r+Omh7rydVL9UZ7iTEWeSSaZ48=";
      };
    }
  ];

  # Extract a package from a tar file
  extractPackage = pkg:
    runCommand "bun2nix-extract-${pkg.name}" {buildInputs = [gnutar coreutils];} ''
      # Extract the files from npm
      mkdir -p $out/${pkg.name}
      tar -xzf ${pkg.path} -C $out/${pkg.name} --strip-components=1

      # Patch binary shebangs to point to bun
      mkdir -p $out/bin
      ln -s ${bun}/bin/bun $out/bin/node
      PATH=$out/bin:$PATH patchShebangs $out/${pkg.name}
      patchShebangs $out/${pkg.name}
    '';

  # List of binary symlinks to create in the `node_modules/.bin` folder
  binaries = {
    is-docker = "../is-docker/cli.js";
    is-in-ci = "../is-in-ci/cli.js";
    is-inside-container = "../is-inside-container/cli.js";
    loose-envify = "../loose-envify/cli.js";
    tsc = "../typescript/bin/tsc";
    tsserver = "../typescript/bin/tsserver";
  };

  # Link a binary from a package
  linkBin = name: dest:
    runCommand "bun2nix-binary-${name}" {} ''
      mkdir -p $out

      ln -sn ${dest} $out/${name}
    '';

  # Construct the .bin directory
  dotBinDir = symlinkJoin {
    name = ".bin";
    paths = lib.mapAttrsToList linkBin binaries;
  };

  # Link the packages to inject into node_modules
  packageFiles = symlinkJoin {
    name = "package-files";
    paths = map extractPackage packages;
  };

  # Build the node modules directory
  nodeModules = runCommand "node-modules" {} ''
    mkdir -p $out

    # Packages need to be regular folders
    cp -rL ${packageFiles}/* $out/

    # Executables need to be symlinks
    cp -r ${dotBinDir} $out/.bin
  '';
in {
  inherit nodeModules packages dotBinDir binaries;
}