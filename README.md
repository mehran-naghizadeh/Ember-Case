# embercase README

## Features

If you have some legacy Ember code, you will most likely have components being called like the following:
```
{{x-user-avatar imageUrl=user.avatar name=user.fullName class="w-6 h-6 mr-4 rounded-full shrink-0"}}
```
With this extension you can put ypur cursor on the line, then press `Ctrl`+`Shodt`+`P`, then select `Ember Case` to get the following

```
<XUserAvatar @imageUrl={{user.avatar}} @name={{user.fullName}} class="w-h-6 mr-4 rounded-full Shrink0" />
```

![embercase-has-block](https://github.com/mehran-naghizadeh/ember-case/assets/24450563/85382cce-e172-452c-9f05-75292118865f)


## Requirements

None.

## Known Issues

None.

## Release Notes

### 0.0.1

Initial release of EmberCase

---

**Enjoy!**
