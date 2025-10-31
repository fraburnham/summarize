#!/usr/bin/env nu

export def dev [] {
  cd popup
  gren make Main --sourcemaps --output=app.js
}

export def "dev auto" [] {
  watch . --glob=**/*.gren { |op, path|
    if not ($path | path basename | str starts-with ".") {
      try {
        dev
      }
    }
  }          
}
