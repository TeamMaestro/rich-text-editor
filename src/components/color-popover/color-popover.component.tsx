import { Component, Element, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'hive-color-popover',
  styleUrl: 'color-popover.component.scss',
  shadow: true
})
export class ColorPopoverComponent {

  @Element() el: HTMLElement;
  @Prop() colors: string[];
  @Prop() position: 'top' | 'bottom';
  activeColor: string;

  @Prop() isOpen: boolean;
  @Watch('isOpen')
  openHandler(newValue: boolean) {
    if (newValue) {
      const input = this.el.shadowRoot.querySelector('#color-input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }
  }

  /**
   * `true` if user can input a custom color.
   */
  @Prop() allowCustomColor = true;

  @Event() colorSelected: EventEmitter;
  colorSelectedHandler(color: string) {
    this.colorSelected.emit(color);
    this.reset();
  }

  colorValidation = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i; // this ensures that the input matches hex code values for a valid color

  onAction(data: string, event?: KeyboardEvent) {
    if (this.allowCustomColor) {
      this.updateSelectorColor();
    }

    if (event) {
      if (event.keyCode === 13) {
        this.colorSelectedHandler(this.activeColor);
      }
    } else if (data) {
      this.colorSelectedHandler(data);
    }
  }

  updateSelectorColor() {
    const input = this.el.shadowRoot.querySelector('#color-input') as HTMLInputElement;
    const hexColorSelector = this.el.shadowRoot.querySelector('#hex-color-selector') as HTMLElement;

    if (!input.value.startsWith('#')) {
      input.value = '#' + input.value;
    } else if (input.value.startsWith('##')) {
      input.value = '#' + input.value.substring(2);
    }

    // if the color isn't valid then it defaults to white. Default color subject to change
    if (this.colorValidation.test(input.value)) {
      hexColorSelector.style.backgroundColor = input.value;
      this.activeColor = input.value;
    } else {
      hexColorSelector.style.backgroundColor = '#fff';
      this.activeColor = null;
    }
  }

  reset() {
    const input = this.el.shadowRoot.querySelector('#color-input') as HTMLInputElement;
    if (input) {
      input.value = '';
      this.updateSelectorColor();
    }
  }

  private renderCustomColorPicker() {
    if (!this.allowCustomColor) {
      return;
    }

    return (
      <div class='color-picker-container'>
        <div id='hex-color-selector' class='color-selector empty' style={{
          backgroundColor: '#fff'
        }}></div>
        <input type='text'
          id='color-input'
          placeholder='#HEX'
          onInput={() => this.updateSelectorColor()}
          onKeyUp={($event: KeyboardEvent) => this.onAction(null, $event)}>
        </input>
      </div>
    )
  }

  render() {
    return [
      <div class={this.position + ' arrow'}></div>,
      <div class={this.position + ' input-container'}>
        <div class='color-selector-container'>
          {this.colors.map((color) => {
            const style = {
              backgroundColor: color
            };
            return <div class='color-selector' style={style} onClick={() => this.onAction(color)}></div>
          })}
        </div>
        {this.renderCustomColorPicker()}
      </div>
    ];
  }
}