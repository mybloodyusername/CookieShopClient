import { Component, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  PagedResultOfProductResponse,
  ApiProductService,
  UserResponse,
  ApiUserService,
} from '../../../../api';
import {
  MatCard,
  MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';

@Component({
  selector: 'cookie-home',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardActions,
    MatButton,
    MatGridList,
    MatGridTile,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly apiUserService = inject(ApiUserService);
  private readonly apiProductService = inject(ApiProductService);
  protected readonly me = resource<UserResponse, never>({
    loader: () => {
      return firstValueFrom(this.apiUserService.apiUserMeGet());
    },
  });

  protected readonly products = resource<PagedResultOfProductResponse, never>({
    loader: () => {
      return firstValueFrom(this.apiProductService.apiProductGet());
    },
  });
}
