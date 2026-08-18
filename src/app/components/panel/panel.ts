import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { map } from 'rxjs/operators';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BreakpointService } from '../../services/breakpoint.service';

@Component({
  selector: 'cookie-panel',
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterOutlet,
    RouterLink,
  ],
})
export class Panel {
  private readonly breakpointService = inject(BreakpointService);

  protected readonly isHandset = this.breakpointService.isHandset;
}
