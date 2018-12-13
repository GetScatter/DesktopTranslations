# Scatter Desktop Translations

In order to add translations to Scatter you will need to do the following:
- Create an issue with "Translating: <LANGUAGE>" so that multiple people don't work on the same language at the same time.
- copy `src/languages/english.json` to a new `src/languages/<LANGUAGE>.json` file.
- Change all the texts in that file to match your target language.

Once you have done that you can then issue a Pull Request with the commits.


### Helper Methods

You'll notice a "plural_s" method inside of the `english.json` file.
You can add custom methods that transform variables for pluralization and other things within
the translation file. These methods are **JavaScript** methods.

When you want to use them simply add `{plural_s}` to the string being translated and it
will be injected with the value from the translation.

**Example**:

```
"methods":[
    {"name":"plural_s", "args":"n = 1", "body":"return parseInt(n) === 1 ? '' : 's'"}
],

// Here the value {x} is a number
"locales":{
    "test_key":"You have {x} key{plural_s}",
}

// This will echo out:
// "You have 4 keys"
```
