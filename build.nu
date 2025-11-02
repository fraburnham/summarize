#!/usr/bin/env nu

def "dev popup" [] {
  cd popup
  gren make Main --sourcemaps --output=app.js
}

def "dev contentscript" [] {
  cd contentScript
  npm run build-dev
}

def "dev serviceworker" [] {
  cd serviceWorker
  npm run build-dev
}

export def dev [] {
  print "\nSTARTING BUILDS!!\n"

  print "Building popup..."
  dev popup

  print "Building contentScript..."
  dev contentscript

  print "Building serviceWorker..."
  dev serviceworker

  print "\nDONE!!\n"
}

def should-auto-build [
  path: string
]: nothing -> bool {
  ( # Is this a .gren or .ts file? (couldn't get --glob=**/*.{ts,gren} to work...)
    (
      $path
      | str ends-with ".gren"
    ) or (
      $path
      | str ends-with ".ts"
    )
  ) and ( # And not a hidden file
    not (
      $path
      | path basename
      | str starts-with "."
    )
  ) and ( # And not in node_modules
    not (
      $path
      | str contains "node_modules"
    )
  )
}

export def "dev auto" [] {
  watch . { |op, path|
    if (should-auto-build $path) {
      try {
        dev
      }
    }
  }          
}
