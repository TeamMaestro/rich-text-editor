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
	@Prop() creating: boolean;

	submit: boolean;

	linkInput: HTMLInputElement;
	textInput: HTMLInputElement;

	@Event() public action: EventEmitter;
	actionHandler(action: string, url: string, text: string) {
		this.submit = true;
		this.action.emit({ action, url, text });
	}

	handleKeyUp(event: KeyboardEvent) {
		if (event.keyCode === 13) {
			let text;

			if (this.linkInput && this.linkInput.value) {
				text = this.linkInput.value;
				if (this.textInput && !!this.textInput.value) {
					text = this.textInput.value;
				} else if (!!this.text) {
					text = this.text;
				}
				this.actionHandler('edit', this.linkInput.value, text);
			} else {
				this.actionHandler('destroy', null, this.text);
			}
		}
	}

	componentDidUnload() {
		if (!this.submit && (!this.text || !this.linkInput.value)) {
			this.actionHandler('destroy', null, this.text);
		}
	}

	componentDidLoad() {
		this.linkInput = this.el.shadowRoot.querySelector('#link-input') as HTMLInputElement;

		if (!this.text) {
			this.textInput = this.el.shadowRoot.querySelector('#text-input') as HTMLInputElement;
		}
	}

	render() {
		return (
			<div>
				<div class='arrow'></div>
				<div class='info-container'>
					<input id="link-input" placeholder="https://" autoFocus value={(this.creating) ? null : this.url} onKeyUp={($event: KeyboardEvent) => this.handleKeyUp($event)}></input>
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