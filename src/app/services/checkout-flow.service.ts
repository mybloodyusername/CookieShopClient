import { Service, signal } from '@angular/core';

@Service()
export class CheckoutFlowService {
  readonly addressId = signal('');
  readonly note = signal('');

  reset() {
    this.addressId.set('');
    this.note.set('');
  }
}
