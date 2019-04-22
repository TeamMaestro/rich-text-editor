import { Component, Element, Event, EventEmitter, Prop } from '@stencil/core';
import { Icons } from '../icons/icons';

@Component({
  tag: 'hive-link-popover',
  styleUrl: 'link-popover.component.scss',
  shadow: true
})
export class LinkPopoverComponent {

  @Element() el: HTMLElement;

  @Prop() url: string;
  @Prop() text: string;
  submit: boolean;

  @Event() public action: EventEmitter;
  actionHandler(action: string, url: string, text: string) {
    this.submit = true;
    this.action.emit({ action, url, text });
  }

  handleKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      const linkInput = this.el.shadowRoot.getElementById('link-input') as HTMLInputElement;
      const textInput = this.el.shadowRoot.getElementById('text-input') as HTMLInputElement;

      let text;

      if (linkInput && !!linkInput.value) {
        text = linkInput.value;
        if (textInput && !!textInput.value) {
          text = textInput.value;
        } else if (!!this.text) {
          text = this.text;
        }
        this.actionHandler('edit', linkInput.value, text);
      } else {
        this.actionHandler('destroy', null, null);
      }

    }
  }

  componentDidUnload() {
    if (!this.submit && !this.text) {
      this.actionHandler('destroy', null, null);
    }
  }

  render() {
    return (
      <div>
        <div class='arrow'></div>
        <div class='info-container'>
          <input id="link-input" placeholder="https://" autoFocus value={(!this.text) ? null : this.url} onKeyUp={($event: KeyboardEvent) => this.handleKeyUp($event)}></input>
          {(!this.text) ?
            <input id="text-input" placeholder="Text to display" value={this.text} onKeyUp={($event: KeyboardEvent) => this.handleKeyUp($event)}></input>
            : null
          }
          <div class="button-container">
            <div class='button' onClick={() => this.actionHandler('open', this.url, this.text)}>
              {Icons.open}
            </div>
            <div class='button' onClick={() => this.actionHandler('unlink', this.url, this.text)}>
              {Icons.unlink}
            </div>
          </div>
        </div>
      </div >
    );
  }
}