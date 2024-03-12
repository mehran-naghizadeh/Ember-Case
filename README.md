# embercase README

## Features

### Template Inatantiation Syntax

If you have some legacy Ember code, you will most likely have components being called like the following:
```
{{x-user-avatar imageUrl=user.avatar name=user.fullName class="w-6 h-6 mr-4 rounded-full shrink-0"}}
```
With this extension you can put ypur cursor on the line, then press `Ctrl`+`Shodt`+`P`, then select `Ember Case` to get the following

```
<XUserAvatar @imageUrl={{user.avatar}} @name={{user.fullName}} class="w-h-6 mr-4 rounded-full Shrink0" />
```

![embercase-has-block](https://github.com/mehran-naghizadeh/ember-case/assets/24450563/85382cce-e172-452c-9f05-75292118865f)


### Template Variable Scoping

In the paset it was totally fine to write `{{variable}}` in an Ember template, which was quite confusing and frustrating. Nowadays. you need to be more specific like `{{this.variable}}` or `{{@variable}}`. This can be a huge road blocker for migrating older apps to Ember 4+. If you are in such a situation, select the variable name you are interested in. Then press `Ctrl` + `Shift` + `P`. Type either `thisify` or `@ify` according to your needs. Press `Enter`. Your entire file is now updated.

**@ify**


<hr>

![atify](https://github.com/mehran-naghizadeh/ember-case/assets/24450563/e9630660-2888-40ea-a71c-540aeeae31b8)

<hr>


**thisify**


<hr>

![thisify](https://github.com/mehran-naghizadeh/ember-case/assets/24450563/52ed5af7-50be-453e-8f44-d894132fd0a8)

<hr>

### Javascript syntax manipulation

**De get**

Conveniently change `this.get('something.somethingElse')` to `this.somethibg.get('somethingElse')` by running `De Get` command from the palette (`Command + Shift + P`).

![g](https://github.com/mehran-naghizadeh/ember-case/assets/24450563/5cf8364a-0bdf-44fc-9014-8a8b6bc58817)


<hr>

**setify**

Conveniently substitute `this.set('key.child1.child2', value)` with `set(this.key, 'child1.child2', value)` by running `setify` command from the palette (`Command + Shift + P`).

![h](https://github.com/mehran-naghizadeh/ember-case/assets/24450563/5166ce44-fd79-4a98-a40d-73241d7d2a4c)

<hr>

## Requirements

An Ember project 🤓


## Known Issues

Not all possible cases are covered. In case you stample upon such a case, please report it.

## Release Notes

### 0.2.0
Intelligently figure out the proper context of a variable, if the project uses pods structure.

### 0.1.0
Facilitate adding `this` or `@` to variable names in templates.

### 0.0.5
Handle an entire block of template code with nested component instantiations.

### 0.0.1

Initial release of EmberCase

---

**Enjoy!**
